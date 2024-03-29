// Code generated by MockGen. DO NOT EDIT.
// Source: interface.go

// Package droneservice is a generated GoMock package.
package droneservice

import (
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
)

// MockDroneService is a mock of DroneService interface.
type MockDroneService struct {
	ctrl     *gomock.Controller
	recorder *MockDroneServiceMockRecorder
}

// MockDroneServiceMockRecorder is the mock recorder for MockDroneService.
type MockDroneServiceMockRecorder struct {
	mock *MockDroneService
}

// NewMockDroneService creates a new mock instance.
func NewMockDroneService(ctrl *gomock.Controller) *MockDroneService {
	mock := &MockDroneService{ctrl: ctrl}
	mock.recorder = &MockDroneServiceMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockDroneService) EXPECT() *MockDroneServiceMockRecorder {
	return m.recorder
}

// ActivateRepository mocks base method.
func (m *MockDroneService) ActivateRepository(repoName string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "ActivateRepository", repoName)
	ret0, _ := ret[0].(error)
	return ret0
}

// ActivateRepository indicates an expected call of ActivateRepository.
func (mr *MockDroneServiceMockRecorder) ActivateRepository(repoName interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "ActivateRepository", reflect.TypeOf((*MockDroneService)(nil).ActivateRepository), repoName)
}

// DeleteRepository mocks base method.
func (m *MockDroneService) DeleteRepository(repoName string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "DeleteRepository", repoName)
	ret0, _ := ret[0].(error)
	return ret0
}

// DeleteRepository indicates an expected call of DeleteRepository.
func (mr *MockDroneServiceMockRecorder) DeleteRepository(repoName interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "DeleteRepository", reflect.TypeOf((*MockDroneService)(nil).DeleteRepository), repoName)
}
