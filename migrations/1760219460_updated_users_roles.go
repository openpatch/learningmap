package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// add role field
		if err := collection.Fields.AddMarshaledJSONAt(10, []byte(`{
			"hidden": false,
			"id": "role_field",
			"maxSelect": 1,
			"name": "role",
			"presentable": false,
			"required": true,
			"system": false,
			"type": "select",
			"values": ["teacher", "student"]
		}`)); err != nil {
			return err
		}

		// add displayName field
		if err := collection.Fields.AddMarshaledJSONAt(11, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "displayname_field",
			"max": 0,
			"min": 0,
			"name": "displayName",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": true,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// add code field for students
		if err := collection.Fields.AddMarshaledJSONAt(12, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "code_field",
			"max": 0,
			"min": 0,
			"name": "code",
			"pattern": "^[A-Z0-9]{6}$",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// Note: email and password fields remain as-is.
		// Students will not use email/password auth, only code-based auth

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("_pb_users_auth_")
		if err != nil {
			return err
		}

		// remove fields
		collection.Fields.RemoveById("role_field")
		collection.Fields.RemoveById("displayname_field")
		collection.Fields.RemoveById("code_field")

		return app.Save(collection)
	})
}
