package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("progress")
		if err != nil {
			return err
		}

		// Update collection rules
		// Students can CRUD their own progress
		// Teachers can read progress for their assignments
		if err := json.Unmarshal([]byte(`{
			"listRule": "@request.auth.id != \"\" && (student = @request.auth.id || assignment.teacher = @request.auth.id)",
			"viewRule": "@request.auth.id != \"\" && (student = @request.auth.id || assignment.teacher = @request.auth.id)",
			"createRule": "@request.auth.id != \"\" && @request.auth.role = \"student\" && student = @request.auth.id",
			"updateRule": "@request.auth.id != \"\" && @request.auth.role = \"student\" && student = @request.auth.id",
			"deleteRule": "@request.auth.id != \"\" && @request.auth.role = \"student\" && student = @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("progress")
		if err != nil {
			return err
		}

		// Revert collection rules
		if err := json.Unmarshal([]byte(`{
			"listRule": null,
			"viewRule": null,
			"createRule": null,
			"updateRule": null,
			"deleteRule": null
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
