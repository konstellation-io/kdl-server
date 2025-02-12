package entity

import (
	v1 "k8s.io/api/core/v1"
)

// PodStatus is an enum for pod status.
type PodStatus string

const (
	PodStatusPending PodStatus = "pending" // Pod is pending to start.
	PodStatusRunning PodStatus = "running" // Pod is running.
	PodStatusFailed  PodStatus = "failed"  // Pod has failed or is in an error state.
)

// IsValid checks if the type is valid.
func (ps PodStatus) IsValid() bool {
	switch ps {
	case PodStatusPending, PodStatusRunning, PodStatusFailed:
		return true
	}

	return false
}

// String implements the fmt.Stringer interface.
func (ps PodStatus) String() string {
	return string(ps)
}

func isWaitingErrorReason(reason string) bool {
	problematicReasons := map[string]bool{
		"CrashLoopBackOff":           true,
		"ImagePullBackOff":           true,
		"ErrImagePull":               true,
		"CreateContainerConfigError": true,
		"CreateContainerError":       true,
		"RunContainerError":          true,
		"ErrImageNeverPull":          true,
		"NetworkNotReady":            true,
	}

	return problematicReasons[reason]
}

// PodStatusFromK8sStatus converts a k8s pod status to a PodStatus.
func PodStatusFromK8sStatus(podStatus v1.PodStatus) PodStatus {
	switch podStatus.Phase {
	case v1.PodPending:
		// loop through all containers in the pod to see if any of them has an error
		for _, cStatus := range podStatus.ContainerStatuses {
			// if container is waiting and reason is an error, return failed
			if cStatus.State.Waiting != nil && isWaitingErrorReason(cStatus.State.Waiting.Reason) {
				return PodStatusFailed
			}
		}

		return PodStatusPending
	case v1.PodRunning:
		return PodStatusRunning
	case v1.PodSucceeded:
		return PodStatusRunning
	case v1.PodFailed:
		return PodStatusFailed
	case v1.PodUnknown:
		return PodStatusFailed
	default:
		return PodStatusFailed
	}
}
