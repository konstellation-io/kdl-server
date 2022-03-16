package sshhelper

import (
	"crypto/ed25519"
	"crypto/rand"
	"crypto/x509"
	"encoding/pem"
	"time"

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
	publicKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, nil, err
	}

	publicKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		return nil, nil, err
	}

	block := &pem.Block{
		Type:  "ssh-ed25519",
		Bytes: publicKeyBytes,
	}
	pub := pem.EncodeToMemory(block)

	privatePem, err := g.encodePrivateKeyToPEM(privateKey)
	if err != nil {
		return nil, nil, err
	}

	return pub, privatePem, nil
}

// encodePrivateKeyToPEM encodes Private Key from RSA to PEM format.
func (g *generator) encodePrivateKeyToPEM(privateKey ed25519.PrivateKey) ([]byte, error) {
	privateKeyBytes, err := x509.MarshalPKCS8PrivateKey(privateKey)
	if err != nil {
		return nil, err
	}

	// pem.Block
	privBlock := pem.Block{
		Type:  "EdDSA PRIVATE KEY",
		Bytes: privateKeyBytes,
	}

	// Private key in PEM format
	privatePEM := pem.EncodeToMemory(&privBlock)

	return privatePEM, nil
}
