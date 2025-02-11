package entity_test

import (
	"testing"

	"github.com/konstellation-io/kdl-server/app/api/entity"
	"github.com/stretchr/testify/suite"
	v1 "k8s.io/api/core/v1"
)

type PodStatusTestSuite struct {
	suite.Suite
}

func TestPodStatusTestTestSuite(t *testing.T) {
	suite.Run(t, new(PodStatusTestSuite))
}

func (s *PodStatusTestSuite) TestPodStatus_IsValid() {
	tests := []struct {
		name string
		ps   entity.PodStatus
		want bool
	}{
		{
			name: "valid pending",
			ps:   entity.PodStatusPending,
			want: true,
		},
		{
			name: "valid running",
			ps:   entity.PodStatusRunning,
			want: true,
		},
		{
			name: "valid failed",
			ps:   entity.PodStatusFailed,
			want: true,
		},
		{
			name: "invalid",
			ps:   "invalid",
			want: false,
		},
	}
	for _, tt := range tests {
		s.Run(tt.name, func() {
			got := tt.ps.IsValid()
			s.Equal(tt.want, got)
		})
	}
}

func (s *PodStatusTestSuite) TestPodStatus_String() {
	tests := []struct {
		name string
		ps   entity.PodStatus
		want string
	}{
		{
			name: "is pending string",
			ps:   entity.PodStatusPending,
			want: "pending",
		},
		{
			name: "is running string",
			ps:   entity.PodStatusRunning,
			want: "running",
		},
		{
			name: "is failed string",
			ps:   entity.PodStatusFailed,
			want: "failed",
		},
	}
	for _, tt := range tests {
		s.Run(tt.name, func() {
			got := tt.ps.String()
			s.Equal(tt.want, got)
		})
	}
}

func (s *PodStatusTestSuite) TestPodStatus_PodStatusFromK8sStatus() {
	tests := []struct {
		name string
		ps   v1.PodStatus
		want entity.PodStatus
	}{
		{
			name: "pod pending status",
			ps: v1.PodStatus{
				Phase: v1.PodPending,
				ContainerStatuses: []v1.ContainerStatus{
					{
						State: v1.ContainerState{
							Waiting: &v1.ContainerStateWaiting{
								Reason: "BuildingImage",
							},
						},
					},
				},
			},
			want: entity.PodStatusPending,
		},
		{
			name: "pod pending status with CrashLoopBackOff container error",
			ps: v1.PodStatus{
				Phase: v1.PodPending,
				ContainerStatuses: []v1.ContainerStatus{
					{
						State: v1.ContainerState{
							Waiting: &v1.ContainerStateWaiting{
								Reason: "CrashLoopBackOff",
							},
						},
					},
				},
			},
			want: entity.PodStatusFailed,
		},
		{
			name: "pod pending status with ImagePullBackOff container error",
			ps: v1.PodStatus{
				Phase: v1.PodPending,
				ContainerStatuses: []v1.ContainerStatus{
					{
						State: v1.ContainerState{
							Waiting: &v1.ContainerStateWaiting{
								Reason: "ImagePullBackOff",
							},
						},
					},
				},
			},
			want: entity.PodStatusFailed,
		},
		{
			name: "pod pending status with ErrImagePull container error",
			ps: v1.PodStatus{
				Phase: v1.PodPending,
				ContainerStatuses: []v1.ContainerStatus{
					{
						State: v1.ContainerState{
							Waiting: &v1.ContainerStateWaiting{
								Reason: "ErrImagePull",
							},
						},
					},
				},
			},
			want: entity.PodStatusFailed,
		},
		{
			name: "pod pending status with CreateContainerConfigError container error",
			ps: v1.PodStatus{
				Phase: v1.PodPending,
				ContainerStatuses: []v1.ContainerStatus{
					{
						State: v1.ContainerState{
							Waiting: &v1.ContainerStateWaiting{
								Reason: "CreateContainerConfigError",
							},
						},
					},
				},
			},
			want: entity.PodStatusFailed,
		},
		{
			name: "pod pending status with CreateContainerError container error",
			ps: v1.PodStatus{
				Phase: v1.PodPending,
				ContainerStatuses: []v1.ContainerStatus{
					{
						State: v1.ContainerState{
							Waiting: &v1.ContainerStateWaiting{
								Reason: "CreateContainerError",
							},
						},
					},
				},
			},
			want: entity.PodStatusFailed,
		},
		{
			name: "pod pending status with RunContainerError container error",
			ps: v1.PodStatus{
				Phase: v1.PodPending,
				ContainerStatuses: []v1.ContainerStatus{
					{
						State: v1.ContainerState{
							Waiting: &v1.ContainerStateWaiting{
								Reason: "RunContainerError",
							},
						},
					},
				},
			},
			want: entity.PodStatusFailed,
		},
		{
			name: "pod pending status with ErrImageNeverPull container error",
			ps: v1.PodStatus{
				Phase: v1.PodPending,
				ContainerStatuses: []v1.ContainerStatus{
					{
						State: v1.ContainerState{
							Waiting: &v1.ContainerStateWaiting{
								Reason: "ErrImageNeverPull",
							},
						},
					},
				},
			},
			want: entity.PodStatusFailed,
		},
		{
			name: "pod pending status with NetworkNotReady container error",
			ps: v1.PodStatus{
				Phase: v1.PodPending,
				ContainerStatuses: []v1.ContainerStatus{
					{
						State: v1.ContainerState{
							Waiting: &v1.ContainerStateWaiting{
								Reason: "NetworkNotReady",
							},
						},
					},
				},
			},
			want: entity.PodStatusFailed,
		},
		{
			name: "pod running status",
			ps:   v1.PodStatus{Phase: v1.PodRunning},
			want: entity.PodStatusRunning,
		},
		{
			name: "pod success status",
			ps:   v1.PodStatus{Phase: v1.PodSucceeded},
			want: entity.PodStatusRunning,
		},
		{
			name: "pod failed status",
			ps:   v1.PodStatus{Phase: v1.PodFailed},
			want: entity.PodStatusFailed,
		},
		{
			name: "pod unknown status",
			ps:   v1.PodStatus{Phase: v1.PodUnknown},
			want: entity.PodStatusFailed,
		},
	}
	for _, tt := range tests {
		s.Run(tt.name, func() {
			got := entity.PodStatusFromK8sStatus(tt.ps)
			s.Equal(tt.want, got)
		})
	}
}
