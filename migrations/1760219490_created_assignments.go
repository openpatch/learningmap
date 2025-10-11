package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection := core.NewBaseCollection("assignments")

		// Get collection IDs
		groupsCollection, err := app.FindCollectionByNameOrId("groups")
		if err != nil {
			return err
		}

		learningmapsCollection, err := app.FindCollectionByNameOrId("learningmaps")
		if err != nil {
			return err
		}

		// add fields
		collection.Fields.Add(
			&core.RelationField{
				Name:         "group",
				Required:     true,
				MaxSelect:    1,
				CollectionId: groupsCollection.Id,
			},
		)

		collection.Fields.Add(
			&core.RelationField{
				Name:         "learningmap",
				Required:     true,
				MaxSelect:    1,
				CollectionId: learningmapsCollection.Id,
			},
		)

		collection.Fields.Add(
			&core.RelationField{
				Name:         "teacher",
				Required:     true,
				MaxSelect:    1,
				CollectionId: "_pb_users_auth_",
			},
		)

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("assignments")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	})
}
