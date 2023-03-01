package droneservice

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

// DroneService defines all Drone operations.
type DroneService interface {
	ActivateRepository(repoName string) error
	DeleteRepository(repoName string) error
}
