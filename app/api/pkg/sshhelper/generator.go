package sshhelper

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/pem"
	"time"

	"github.com/mikesmitty/edkey"

	"golang.org/x/crypto/ssh"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
)

type generator struct {
	logger logging.Logger
}

// NewGenerator is a constructor function.
func NewGenerator(logger logging.Logger) SSHKeyGenerator {
	return &generator{
		logger: logger,
	}
}

// NewKeys returns a new private and public SSH keys.
func (g *generator) NewKeys() (entity.SSHKey, error) {
	publicKeyBytes, privateKeyBytes, err := g.generateKeyPair()
	if err != nil {
		return entity.SSHKey{}, err
	}

	return entity.SSHKey{
		Public:       string(publicKeyBytes),
		Private:      string(privateKeyBytes),
		CreationDate: time.Now().UTC(),
	}, nil
}

func (g *generator) generateKeyPair() (public, private []byte, err error) {
	pubKey, privKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, nil, err
	}

	sshPubKey, err := ssh.NewPublicKey(pubKey)
	if err != nil {
		return nil, nil, err
	}

	pemKey := &pem.Block{
		Type:  "OPENSSH PRIVATE KEY",
		Bytes: edkey.MarshalED25519PrivateKey(privKey),
	}
	privateKey := pem.EncodeToMemory(pemKey)
	publicKey := ssh.MarshalAuthorizedKey(sshPubKey)

	return publicKey, privateKey, nil
}
