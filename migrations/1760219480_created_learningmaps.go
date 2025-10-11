package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection := core.NewBaseCollection("learningmaps")

		// add fields
		collection.Fields.Add(
			&core.TextField{
				Name:     "name",
				Required: true,
			},
		)

		collection.Fields.Add(
			&core.JSONField{
				Name:     "roadmapData",
				Required: true,
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
		collection, err := app.FindCollectionByNameOrId("learningmaps")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	})
}
