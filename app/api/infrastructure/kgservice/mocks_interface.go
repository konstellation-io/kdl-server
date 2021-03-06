// Code generated by MockGen. DO NOT EDIT.
// Source: interface.go

// Package kgservice is a generated GoMock package.
package kgservice

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
	entity "github.com/konstellation-io/kdl-server/app/api/entity"
)

// MockKGService is a mock of KGService interface.
type MockKGService struct {
	ctrl     *gomock.Controller
	recorder *MockKGServiceMockRecorder
}

// MockKGServiceMockRecorder is the mock recorder for MockKGService.
type MockKGServiceMockRecorder struct {
	mock *MockKGService
}

// NewMockKGService creates a new mock instance.
func NewMockKGService(ctrl *gomock.Controller) *MockKGService {
	mock := &MockKGService{ctrl: ctrl}
	mock.recorder = &MockKGServiceMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockKGService) EXPECT() *MockKGServiceMockRecorder {
	return m.recorder
}

// DescriptionQuality mocks base method.
func (m *MockKGService) DescriptionQuality(ctx context.Context, description string) (int, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "DescriptionQuality", ctx, description)
	ret0, _ := ret[0].(int)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// DescriptionQuality indicates an expected call of DescriptionQuality.
func (mr *MockKGServiceMockRecorder) DescriptionQuality(ctx, description interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "DescriptionQuality", reflect.TypeOf((*MockKGService)(nil).DescriptionQuality), ctx, description)
}

// Graph mocks base method.
func (m *MockKGService) Graph(ctx context.Context, description string) (entity.KnowledgeGraph, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Graph", ctx, description)
	ret0, _ := ret[0].(entity.KnowledgeGraph)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Graph indicates an expected call of Graph.
func (mr *MockKGServiceMockRecorder) Graph(ctx, description interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Graph", reflect.TypeOf((*MockKGService)(nil).Graph), ctx, description)
}
