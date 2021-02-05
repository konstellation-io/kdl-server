package sshhelper

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"time"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/konstellation-io/kdl-server/app/api/pkg/logging"
	"golang.org/x/crypto/ssh"
)

type Generator struct {
	logger logging.Logger
}

func NewGenerator(logger logging.Logger) *Generator {
	return &Generator{
		logger: logger,
	}
}

func (g *Generator) NewKeys() (entity.SSHKey, error) {
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
func (g *Generator) generatePrivateKey(bitSize int) (*rsa.PrivateKey, error) {
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
func (g *Generator) encodePrivateKeyToPEM(privateKey *rsa.PrivateKey) []byte {
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
func (g *Generator) generatePublicKey(privatekey *rsa.PublicKey) ([]byte, error) {
	publicRsaKey, err := ssh.NewPublicKey(privatekey)
	if err != nil {
		return nil, err
	}

	pubKeyBytes := ssh.MarshalAuthorizedKey(publicRsaKey)

	g.logger.Info("Public key generated")

	return pubKeyBytes, nil
}
