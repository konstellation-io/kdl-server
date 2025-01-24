package entity

import v1 "k8s.io/api/core/v1"

// PodStatus is an enum for pod status.
type PodStatus string

const (
	PodStatusPending PodStatus = "pending"

	PodStatusRunning PodStatus = "running"

	PodStatusSucceeded PodStatus = "succeeded"

	PodStatusFailed PodStatus = "failed"

	PodStatusUnknown PodStatus = "unknown"
)

// IsValid checks if the type is valid.
func (ps PodStatus) IsValid() bool {
	switch ps {
	case PodStatusPending, PodStatusRunning, PodStatusSucceeded, PodStatusFailed, PodStatusUnknown:
		return true
	}

	return false
}

// String implements the fmt.Stringer interface.
func (ps PodStatus) String() string {
	return string(ps)
}

// PodStatusFromK8sStatus converts a k8s pod status to a PodStatus.
func PodStatusFromK8sStatus(status v1.PodPhase) PodStatus {
	switch status {
	case v1.PodPending:
		return PodStatusPending
	case v1.PodRunning:
		return PodStatusRunning
	case v1.PodSucceeded:
		return PodStatusSucceeded
	case v1.PodFailed:
		return PodStatusFailed
	case v1.PodUnknown:
		return PodStatusUnknown
	default:
		return PodStatusUnknown
	}
}
