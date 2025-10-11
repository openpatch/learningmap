package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// Update collection rules
		if err := json.Unmarshal([]byte(`{
			"listRule": "@request.auth.id != \"\"",
			"viewRule": "@request.auth.id != \"\"",
			"updateRule": "@request.auth.id = id"
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// Revert collection rules
		if err := json.Unmarshal([]byte(`{
			"listRule": null,
			"viewRule": null,
			"updateRule": null
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
