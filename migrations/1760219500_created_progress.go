package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection := core.NewBaseCollection("progress")

		// Get collection ID
		assignmentsCollection, err := app.FindCollectionByNameOrId("assignments")
		if err != nil {
			return err
		}

		// add fields
		collection.Fields.Add(
			&core.RelationField{
				Name:         "student",
				Required:     true,
				MaxSelect:    1,
				CollectionId: "_pb_users_auth_",
			},
		)

		collection.Fields.Add(
			&core.RelationField{
				Name:         "assignment",
				Required:     true,
				MaxSelect:    1,
				CollectionId: assignmentsCollection.Id,
			},
		)

		collection.Fields.Add(
			&core.JSONField{
				Name:     "roadmapState",
				Required: true,
			},
		)

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("progress")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	})
}
