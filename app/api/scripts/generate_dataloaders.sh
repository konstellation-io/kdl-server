#!/bin/sh

cd infrastructure/dataloader

go run github.com/vektah/dataloaden UserLoader string "github.com/konstellation-io/kdl-server/app/api/entity.User"
