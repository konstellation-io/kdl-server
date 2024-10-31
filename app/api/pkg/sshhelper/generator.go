package sshhelper

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"time"

	"github.com/go-logr/logr"
	"golang.org/x/crypto/ssh"

	"github.com/konstellation-io/kdl-server/app/api/entity"
)

type generator struct {
	logger logr.Logger
}

// NewGenerator is a constructor function.
func NewGenerator(logger logr.Logger) SSHKeyGenerator {
	return &generator{
		logger: logger,
	}
}

// NewKeys returns a new private and public SSH keys.
func (g *generator) NewKeys() (entity.SSHKey, error) {
	bitSize := 4096

	privateKey, err := g.generatePrivateKey(bitSize)
	if err != nil {
		return entity.SSHKey{}, err
	}

	publicKeyBytes, err := g.generatePublicKey(&privateKey.PublicKey)
	if err != nil {
		return entity.SSHKey{}, err
	}

	privateKeyBytes := g.encodePrivateKeyToPEM(privateKey)

	return entity.SSHKey{
		Public:       string(publicKeyBytes),
		Private:      string(privateKeyBytes),
		CreationDate: time.Now().UTC(),
	}, nil
}

// generatePrivateKey creates a RSA Private Key of specified byte size.
func (g *generator) generatePrivateKey(bitSize int) (*rsa.PrivateKey, error) {
	// Private Key generation
	privateKey, err := rsa.GenerateKey(rand.Reader, bitSize)
	if err != nil {
		return nil, err
	}

	// Validate Private Key
	err = privateKey.Validate()
	if err != nil {
		return nil, err
	}

	g.logger.Info("Private Key generated")

	return privateKey, nil
}

// encodePrivateKeyToPEM encodes Private Key from RSA to PEM format.
func (g *generator) encodePrivateKeyToPEM(privateKey *rsa.PrivateKey) []byte {
	// Get ASN.1 DER format
	privDER := x509.MarshalPKCS1PrivateKey(privateKey)

	// pem.Block
	privBlock := pem.Block{
		Type:    "RSA PRIVATE KEY",
		Headers: nil,
		Bytes:   privDER,
	}

	// Private key in PEM format
	privatePEM := pem.EncodeToMemory(&privBlock)

	return privatePEM
}

// generatePublicKey take a rsa.PublicKey and return bytes suitable for writing to .pub file
// returns in the format "ssh-rsa ...".
func (g *generator) generatePublicKey(privatekey *rsa.PublicKey) ([]byte, error) {
	publicRsaKey, err := ssh.NewPublicKey(privatekey)
	if err != nil {
		return nil, err
	}

	pubKeyBytes := ssh.MarshalAuthorizedKey(publicRsaKey)

	g.logger.Info("Public key generated")

	return pubKeyBytes, nil
}
