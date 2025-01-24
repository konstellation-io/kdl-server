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
			name: "valid succeeded",
			ps:   entity.PodStatusSucceeded,
			want: true,
		},
		{
			name: "valid failed",
			ps:   entity.PodStatusFailed,
			want: true,
		},
		{
			name: "valid unknown",
			ps:   entity.PodStatusUnknown,
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
			name: "is succeeded string",
			ps:   entity.PodStatusSucceeded,
			want: "succeeded",
		},
		{
			name: "is failed string",
			ps:   entity.PodStatusFailed,
			want: "failed",
		},
		{
			name: "is unknown string",
			ps:   entity.PodStatusUnknown,
			want: "unknown",
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
		ph   v1.PodPhase
		want entity.PodStatus
	}{
		{
			name: "pod pending status",
			ph:   v1.PodPending,
			want: entity.PodStatusPending,
		},
		{
			name: "pod running status",
			ph:   v1.PodRunning,
			want: entity.PodStatusRunning,
		},
		{
			name: "pod succeeded status",
			ph:   v1.PodSucceeded,
			want: entity.PodStatusSucceeded,
		},
		{
			name: "pod failed status",
			ph:   v1.PodFailed,
			want: entity.PodStatusFailed,
		},
		{
			name: "pod unknown status",
			ph:   v1.PodUnknown,
			want: entity.PodStatusUnknown,
		},
	}
	for _, tt := range tests {
		s.Run(tt.name, func() {
			got := entity.PodStatusFromK8sStatus(tt.ph)
			s.Equal(tt.want, got)
		})
	}
}
