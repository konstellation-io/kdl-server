package mongodbutils

import (
	"context"
	"time"

	"github.com/go-logr/logr"
	"go.mongodb.org/mongo-driver/mongo/readpref"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const timeout = 20 * time.Second

// MongoDB will manage the connection with the database.
type MongoDB struct {
	logger logr.Logger
	client *mongo.Client
}

// NewMongoDB is a constructor function.
func NewMongoDB(logger logr.Logger, uri string) (*MongoDB, error) {
	logger.Info("MongoDB connecting...")

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	logger.Info("MongoDB connected")

	return &MongoDB{logger, client}, nil
}

func (m *MongoDB) Ping() bool {
	err := m.client.Ping(context.Background(), readpref.Primary())
	if err != nil {
		m.logger.Error(err, "MongoDB ping failed")
		return false
	}

	return true
}

// Disconnect closes the connection with the database.
func (m *MongoDB) Disconnect() {
	m.logger.Info("MongoDB disconnecting...")

	if m.client == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	err := m.client.Disconnect(ctx)
	if err != nil {
		m.logger.Error(err, "Error disconnecting from MongoDB")
		return
	}

	m.logger.Info("Connection to MongoDB closed")
}

// CreateCollection creates a new collection in the database.
func (m *MongoDB) CreateCollection(dbName, collName string) *mongo.Collection {
	return m.client.Database(dbName).Collection(collName)
}

// Drop database.
func (m *MongoDB) DropDatabase(dbName string) error {
	m.logger.Info("MongoDB dropping database...")

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	err := m.client.Database(dbName).Drop(ctx)
	if err != nil {
		return err
	}

	m.logger.Info("Database dropped")

	return nil
}
