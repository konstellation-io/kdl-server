package utils

import (
	"context"
	"time"

	"github.com/go-logr/logr"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

const timeout = 20 * time.Second

// MongoDB will manage the connection with the database.
type MongoDB struct {
	client *mongo.Client
	logger logr.Logger
}

// NewMongoDB is a constructor function.
func NewMongoDB(logger logr.Logger) *MongoDB {
	return &MongoDB{
		client: nil,
		logger: logger,
	}
}

// Connect open a database connection and check if it is connecting using ping.
func (m *MongoDB) Connect(uri string) (*mongo.Client, error) {
	m.logger.Info("MongoDB connecting...")

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	m.logger.Info("MongoDB ping...")

	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return nil, err
	}

	m.logger.Info("MongoDB connected")
	m.client = client

	return client, nil
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

	m.logger.Info("Connection to MongoDB closed.")
}
