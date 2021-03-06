// Code generated by MockGen. DO NOT EDIT.
// Source: interface.go

// Package kg is a generated GoMock package.
package kg

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
	entity "github.com/konstellation-io/kdl-server/app/api/entity"
)

// MockUseCase is a mock of UseCase interface.
type MockUseCase struct {
	ctrl     *gomock.Controller
	recorder *MockUseCaseMockRecorder
}

// MockUseCaseMockRecorder is the mock recorder for MockUseCase.
type MockUseCaseMockRecorder struct {
	mock *MockUseCase
}

// NewMockUseCase creates a new mock instance.
func NewMockUseCase(ctrl *gomock.Controller) *MockUseCase {
	mock := &MockUseCase{ctrl: ctrl}
	mock.recorder = &MockUseCaseMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockUseCase) EXPECT() *MockUseCaseMockRecorder {
	return m.recorder
}

// DescriptionQuality mocks base method.
func (m *MockUseCase) DescriptionQuality(ctx context.Context, description string) (int, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "DescriptionQuality", ctx, description)
	ret0, _ := ret[0].(int)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// DescriptionQuality indicates an expected call of DescriptionQuality.
func (mr *MockUseCaseMockRecorder) DescriptionQuality(ctx, description interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "DescriptionQuality", reflect.TypeOf((*MockUseCase)(nil).DescriptionQuality), ctx, description)
}

// Graph mocks base method.
func (m *MockUseCase) Graph(ctx context.Context, project entity.Project) (entity.KnowledgeGraph, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Graph", ctx, project)
	ret0, _ := ret[0].(entity.KnowledgeGraph)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Graph indicates an expected call of Graph.
func (mr *MockUseCaseMockRecorder) Graph(ctx, project interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Graph", reflect.TypeOf((*MockUseCase)(nil).Graph), ctx, project)
}
