package mongodb

import (
	"context"
	"os"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/infrastructure/logging"
	"go.mongodb.org/mongo-driver/mongo/readpref"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const timeout = 20 * time.Second

type MongoDB struct {
	logger logging.Logger
	client *mongo.Client
}

func NewMongoDB(logger logging.Logger) *MongoDB {
	return &MongoDB{
		logger,
		nil,
	}
}

func (m *MongoDB) Connect(address string) (*mongo.Client, error) {
	m.logger.Info("MongoDB connecting...")

	client, err := mongo.NewClient(options.Client().ApplyURI(address))
	if err != nil {
		m.logger.Error(err.Error())
		os.Exit(1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	err = client.Connect(ctx)
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

func (m *MongoDB) Disconnect() {
	m.logger.Info("MongoDB disconnecting...")

	if m.client == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	err := m.client.Disconnect(ctx)
	if err != nil {
		m.logger.Errorf("Error disconnecting from MongoDB: %s", err)
	}

	m.logger.Info("Connection to MongoDB closed.")
}
