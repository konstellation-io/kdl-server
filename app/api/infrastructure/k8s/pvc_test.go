//go:build integration

package k8s_test

import (
	"context"

	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

const (
	pvcName          = "pvc-name"
	resourceQuantity = "1Gi"
)

func (s *testSuite) TestGetPVC() {
	// Arrange a pvc
	_, err := s.Clientset.CoreV1().PersistentVolumeClaims(namespace).Create(
		context.Background(),
		&v1.PersistentVolumeClaim{
			ObjectMeta: metav1.ObjectMeta{
				Name: pvcName,
			},
			Spec: v1.PersistentVolumeClaimSpec{
				AccessModes: []v1.PersistentVolumeAccessMode{v1.ReadWriteOnce},
				Resources: v1.VolumeResourceRequirements{
					Requests: v1.ResourceList{
						v1.ResourceStorage: resource.MustParse(resourceQuantity),
					},
				},
			},
		},
		metav1.CreateOptions{},
	)

	s.Require().NoError(err)

	// Assert pvc exists
	pvc, err := s.Client.GetPVC(context.Background(), pvcName)
	s.Require().NoError(err)
	s.Require().NotEmpty(pvc)
	s.Require().Equal(pvcName, pvc.Name)
}
