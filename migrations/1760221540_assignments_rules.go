package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("assignments")
		if err != nil {
			return err
		}

		// Update collection rules
		// Teachers can CRUD their assignments
		// Students can read assignments for groups they belong to
		if err := json.Unmarshal([]byte(`{
			"listRule": "@request.auth.id != \"\" && (teacher = @request.auth.id || group.students.id ?= @request.auth.id)",
			"viewRule": "@request.auth.id != \"\" && (teacher = @request.auth.id || group.students.id ?= @request.auth.id)",
			"createRule": "@request.auth.id != \"\" && @request.auth.role = \"teacher\" && teacher = @request.auth.id",
			"updateRule": "@request.auth.id != \"\" && @request.auth.role = \"teacher\" && teacher = @request.auth.id",
			"deleteRule": "@request.auth.id != \"\" && @request.auth.role = \"teacher\" && teacher = @request.auth.id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("assignments")
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
