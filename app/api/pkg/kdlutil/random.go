package kdlutil

import (
	"crypto/rand"
	"math/big"
)

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}
type RandomGenerator interface {
	GenerateRandomString(n int) (string, error)
}

type RandomGeneratorImplementation struct{}

func NewRandomGenerator() *RandomGeneratorImplementation {
	return &RandomGeneratorImplementation{}
}

// GenerateRandomString returns a securely generated random string.
// It will return an error if the system's secure random
// number generator fails to function correctly, in which
// case the caller should not continue.
func (r *RandomGeneratorImplementation) GenerateRandomString(n int) (string, error) {
	const letters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-"

	ret := make([]byte, n)

	for i := 0; i < n; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}

		ret[i] = letters[num.Int64()]
	}

	return string(ret), nil
}
