// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.25.0
// 	protoc        v3.14.0
// source: proto/knowledge_graph.proto

package kgpb

import (
	proto "github.com/golang/protobuf/proto"
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

// This is a compile-time assertion that a sufficiently up-to-date version
// of the legacy proto package is being used.
const _ = proto.ProtoPackageIsVersion4

type GetGraphReq struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Description string `protobuf:"bytes,1,opt,name=description,proto3" json:"description,omitempty"`
}

func (x *GetGraphReq) Reset() {
	*x = GetGraphReq{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_knowledge_graph_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetGraphReq) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetGraphReq) ProtoMessage() {}

func (x *GetGraphReq) ProtoReflect() protoreflect.Message {
	mi := &file_proto_knowledge_graph_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetGraphReq.ProtoReflect.Descriptor instead.
func (*GetGraphReq) Descriptor() ([]byte, []int) {
	return file_proto_knowledge_graph_proto_rawDescGZIP(), []int{0}
}

func (x *GetGraphReq) GetDescription() string {
	if x != nil {
		return x.Description
	}
	return ""
}

type DescriptionQualityReq struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Description string `protobuf:"bytes,1,opt,name=description,proto3" json:"description,omitempty"`
}

func (x *DescriptionQualityReq) Reset() {
	*x = DescriptionQualityReq{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_knowledge_graph_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DescriptionQualityReq) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DescriptionQualityReq) ProtoMessage() {}

func (x *DescriptionQualityReq) ProtoReflect() protoreflect.Message {
	mi := &file_proto_knowledge_graph_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DescriptionQualityReq.ProtoReflect.Descriptor instead.
func (*DescriptionQualityReq) Descriptor() ([]byte, []int) {
	return file_proto_knowledge_graph_proto_rawDescGZIP(), []int{1}
}

func (x *DescriptionQualityReq) GetDescription() string {
	if x != nil {
		return x.Description
	}
	return ""
}

type DescriptionQualityRes struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	QualityScore int32 `protobuf:"varint,1,opt,name=quality_score,json=qualityScore,proto3" json:"quality_score,omitempty"`
}

func (x *DescriptionQualityRes) Reset() {
	*x = DescriptionQualityRes{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_knowledge_graph_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *DescriptionQualityRes) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*DescriptionQualityRes) ProtoMessage() {}

func (x *DescriptionQualityRes) ProtoReflect() protoreflect.Message {
	mi := &file_proto_knowledge_graph_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use DescriptionQualityRes.ProtoReflect.Descriptor instead.
func (*DescriptionQualityRes) Descriptor() ([]byte, []int) {
	return file_proto_knowledge_graph_proto_rawDescGZIP(), []int{2}
}

func (x *DescriptionQualityRes) GetQualityScore() int32 {
	if x != nil {
		return x.QualityScore
	}
	return 0
}

type GraphItem struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id         string   `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
	Category   string   `protobuf:"bytes,2,opt,name=category,proto3" json:"category,omitempty"`
	Title      string   `protobuf:"bytes,3,opt,name=title,proto3" json:"title,omitempty"`
	Abstract   string   `protobuf:"bytes,4,opt,name=abstract,proto3" json:"abstract,omitempty"`
	Authors    []string `protobuf:"bytes,5,rep,name=authors,proto3" json:"authors,omitempty"`
	Score      float32  `protobuf:"fixed32,6,opt,name=score,proto3" json:"score,omitempty"`
	Date       string   `protobuf:"bytes,7,opt,name=date,proto3" json:"date,omitempty"`
	Url        string   `protobuf:"bytes,8,opt,name=url,proto3" json:"url,omitempty"`
	ExternalId string   `protobuf:"bytes,9,opt,name=external_id,json=externalId,proto3" json:"external_id,omitempty"`
	Topics     []*Topic `protobuf:"bytes,10,rep,name=topics,proto3" json:"topics,omitempty"`
	RepoUrls   []string `protobuf:"bytes,11,rep,name=repo_urls,json=repoUrls,proto3" json:"repo_urls,omitempty"`
	Frameworks []string `protobuf:"bytes,12,rep,name=frameworks,proto3" json:"frameworks,omitempty"`
}

func (x *GraphItem) Reset() {
	*x = GraphItem{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_knowledge_graph_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GraphItem) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GraphItem) ProtoMessage() {}

func (x *GraphItem) ProtoReflect() protoreflect.Message {
	mi := &file_proto_knowledge_graph_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GraphItem.ProtoReflect.Descriptor instead.
func (*GraphItem) Descriptor() ([]byte, []int) {
	return file_proto_knowledge_graph_proto_rawDescGZIP(), []int{3}
}

func (x *GraphItem) GetId() string {
	if x != nil {
		return x.Id
	}
	return ""
}

func (x *GraphItem) GetCategory() string {
	if x != nil {
		return x.Category
	}
	return ""
}

func (x *GraphItem) GetTitle() string {
	if x != nil {
		return x.Title
	}
	return ""
}

func (x *GraphItem) GetAbstract() string {
	if x != nil {
		return x.Abstract
	}
	return ""
}

func (x *GraphItem) GetAuthors() []string {
	if x != nil {
		return x.Authors
	}
	return nil
}

func (x *GraphItem) GetScore() float32 {
	if x != nil {
		return x.Score
	}
	return 0
}

func (x *GraphItem) GetDate() string {
	if x != nil {
		return x.Date
	}
	return ""
}

func (x *GraphItem) GetUrl() string {
	if x != nil {
		return x.Url
	}
	return ""
}

func (x *GraphItem) GetExternalId() string {
	if x != nil {
		return x.ExternalId
	}
	return ""
}

func (x *GraphItem) GetTopics() []*Topic {
	if x != nil {
		return x.Topics
	}
	return nil
}

func (x *GraphItem) GetRepoUrls() []string {
	if x != nil {
		return x.RepoUrls
	}
	return nil
}

func (x *GraphItem) GetFrameworks() []string {
	if x != nil {
		return x.Frameworks
	}
	return nil
}

type Topic struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Name      string  `protobuf:"bytes,1,opt,name=name,proto3" json:"name,omitempty"`
	Relevance float32 `protobuf:"fixed32,2,opt,name=relevance,proto3" json:"relevance,omitempty"`
}

func (x *Topic) Reset() {
	*x = Topic{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_knowledge_graph_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Topic) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Topic) ProtoMessage() {}

func (x *Topic) ProtoReflect() protoreflect.Message {
	mi := &file_proto_knowledge_graph_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Topic.ProtoReflect.Descriptor instead.
func (*Topic) Descriptor() ([]byte, []int) {
	return file_proto_knowledge_graph_proto_rawDescGZIP(), []int{4}
}

func (x *Topic) GetName() string {
	if x != nil {
		return x.Name
	}
	return ""
}

func (x *Topic) GetRelevance() float32 {
	if x != nil {
		return x.Relevance
	}
	return 0
}

type GetGraphRes struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Items  []*GraphItem `protobuf:"bytes,1,rep,name=items,proto3" json:"items,omitempty"`
	Topics []*Topic     `protobuf:"bytes,2,rep,name=topics,proto3" json:"topics,omitempty"`
}

func (x *GetGraphRes) Reset() {
	*x = GetGraphRes{}
	if protoimpl.UnsafeEnabled {
		mi := &file_proto_knowledge_graph_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetGraphRes) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetGraphRes) ProtoMessage() {}

func (x *GetGraphRes) ProtoReflect() protoreflect.Message {
	mi := &file_proto_knowledge_graph_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetGraphRes.ProtoReflect.Descriptor instead.
func (*GetGraphRes) Descriptor() ([]byte, []int) {
	return file_proto_knowledge_graph_proto_rawDescGZIP(), []int{5}
}

func (x *GetGraphRes) GetItems() []*GraphItem {
	if x != nil {
		return x.Items
	}
	return nil
}

func (x *GetGraphRes) GetTopics() []*Topic {
	if x != nil {
		return x.Topics
	}
	return nil
}

var File_proto_knowledge_graph_proto protoreflect.FileDescriptor

var file_proto_knowledge_graph_proto_rawDesc = []byte{
	0x0a, 0x1b, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x6b, 0x6e, 0x6f, 0x77, 0x6c, 0x65, 0x64, 0x67,
	0x65, 0x5f, 0x67, 0x72, 0x61, 0x70, 0x68, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x02, 0x6b,
	0x67, 0x22, 0x2f, 0x0a, 0x0b, 0x47, 0x65, 0x74, 0x47, 0x72, 0x61, 0x70, 0x68, 0x52, 0x65, 0x71,
	0x12, 0x20, 0x0a, 0x0b, 0x64, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x0b, 0x64, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69,
	0x6f, 0x6e, 0x22, 0x39, 0x0a, 0x15, 0x44, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f,
	0x6e, 0x51, 0x75, 0x61, 0x6c, 0x69, 0x74, 0x79, 0x52, 0x65, 0x71, 0x12, 0x20, 0x0a, 0x0b, 0x64,
	0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09,
	0x52, 0x0b, 0x64, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x22, 0x3c, 0x0a,
	0x15, 0x44, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x51, 0x75, 0x61, 0x6c,
	0x69, 0x74, 0x79, 0x52, 0x65, 0x73, 0x12, 0x23, 0x0a, 0x0d, 0x71, 0x75, 0x61, 0x6c, 0x69, 0x74,
	0x79, 0x5f, 0x73, 0x63, 0x6f, 0x72, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x05, 0x52, 0x0c, 0x71,
	0x75, 0x61, 0x6c, 0x69, 0x74, 0x79, 0x53, 0x63, 0x6f, 0x72, 0x65, 0x22, 0xc0, 0x02, 0x0a, 0x09,
	0x47, 0x72, 0x61, 0x70, 0x68, 0x49, 0x74, 0x65, 0x6d, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x02, 0x69, 0x64, 0x12, 0x1a, 0x0a, 0x08, 0x63, 0x61, 0x74,
	0x65, 0x67, 0x6f, 0x72, 0x79, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x63, 0x61, 0x74,
	0x65, 0x67, 0x6f, 0x72, 0x79, 0x12, 0x14, 0x0a, 0x05, 0x74, 0x69, 0x74, 0x6c, 0x65, 0x18, 0x03,
	0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x74, 0x69, 0x74, 0x6c, 0x65, 0x12, 0x1a, 0x0a, 0x08, 0x61,
	0x62, 0x73, 0x74, 0x72, 0x61, 0x63, 0x74, 0x18, 0x04, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x61,
	0x62, 0x73, 0x74, 0x72, 0x61, 0x63, 0x74, 0x12, 0x18, 0x0a, 0x07, 0x61, 0x75, 0x74, 0x68, 0x6f,
	0x72, 0x73, 0x18, 0x05, 0x20, 0x03, 0x28, 0x09, 0x52, 0x07, 0x61, 0x75, 0x74, 0x68, 0x6f, 0x72,
	0x73, 0x12, 0x14, 0x0a, 0x05, 0x73, 0x63, 0x6f, 0x72, 0x65, 0x18, 0x06, 0x20, 0x01, 0x28, 0x02,
	0x52, 0x05, 0x73, 0x63, 0x6f, 0x72, 0x65, 0x12, 0x12, 0x0a, 0x04, 0x64, 0x61, 0x74, 0x65, 0x18,
	0x07, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x64, 0x61, 0x74, 0x65, 0x12, 0x10, 0x0a, 0x03, 0x75,
	0x72, 0x6c, 0x18, 0x08, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x75, 0x72, 0x6c, 0x12, 0x1f, 0x0a,
	0x0b, 0x65, 0x78, 0x74, 0x65, 0x72, 0x6e, 0x61, 0x6c, 0x5f, 0x69, 0x64, 0x18, 0x09, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x0a, 0x65, 0x78, 0x74, 0x65, 0x72, 0x6e, 0x61, 0x6c, 0x49, 0x64, 0x12, 0x21,
	0x0a, 0x06, 0x74, 0x6f, 0x70, 0x69, 0x63, 0x73, 0x18, 0x0a, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x09,
	0x2e, 0x6b, 0x67, 0x2e, 0x54, 0x6f, 0x70, 0x69, 0x63, 0x52, 0x06, 0x74, 0x6f, 0x70, 0x69, 0x63,
	0x73, 0x12, 0x1b, 0x0a, 0x09, 0x72, 0x65, 0x70, 0x6f, 0x5f, 0x75, 0x72, 0x6c, 0x73, 0x18, 0x0b,
	0x20, 0x03, 0x28, 0x09, 0x52, 0x08, 0x72, 0x65, 0x70, 0x6f, 0x55, 0x72, 0x6c, 0x73, 0x12, 0x1e,
	0x0a, 0x0a, 0x66, 0x72, 0x61, 0x6d, 0x65, 0x77, 0x6f, 0x72, 0x6b, 0x73, 0x18, 0x0c, 0x20, 0x03,
	0x28, 0x09, 0x52, 0x0a, 0x66, 0x72, 0x61, 0x6d, 0x65, 0x77, 0x6f, 0x72, 0x6b, 0x73, 0x22, 0x39,
	0x0a, 0x05, 0x54, 0x6f, 0x70, 0x69, 0x63, 0x12, 0x12, 0x0a, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x18,
	0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x6e, 0x61, 0x6d, 0x65, 0x12, 0x1c, 0x0a, 0x09, 0x72,
	0x65, 0x6c, 0x65, 0x76, 0x61, 0x6e, 0x63, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28, 0x02, 0x52, 0x09,
	0x72, 0x65, 0x6c, 0x65, 0x76, 0x61, 0x6e, 0x63, 0x65, 0x22, 0x55, 0x0a, 0x0b, 0x47, 0x65, 0x74,
	0x47, 0x72, 0x61, 0x70, 0x68, 0x52, 0x65, 0x73, 0x12, 0x23, 0x0a, 0x05, 0x69, 0x74, 0x65, 0x6d,
	0x73, 0x18, 0x01, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x0d, 0x2e, 0x6b, 0x67, 0x2e, 0x47, 0x72, 0x61,
	0x70, 0x68, 0x49, 0x74, 0x65, 0x6d, 0x52, 0x05, 0x69, 0x74, 0x65, 0x6d, 0x73, 0x12, 0x21, 0x0a,
	0x06, 0x74, 0x6f, 0x70, 0x69, 0x63, 0x73, 0x18, 0x02, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x09, 0x2e,
	0x6b, 0x67, 0x2e, 0x54, 0x6f, 0x70, 0x69, 0x63, 0x52, 0x06, 0x74, 0x6f, 0x70, 0x69, 0x63, 0x73,
	0x32, 0x8c, 0x01, 0x0a, 0x09, 0x4b, 0x47, 0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x12, 0x2e,
	0x0a, 0x08, 0x47, 0x65, 0x74, 0x47, 0x72, 0x61, 0x70, 0x68, 0x12, 0x0f, 0x2e, 0x6b, 0x67, 0x2e,
	0x47, 0x65, 0x74, 0x47, 0x72, 0x61, 0x70, 0x68, 0x52, 0x65, 0x71, 0x1a, 0x0f, 0x2e, 0x6b, 0x67,
	0x2e, 0x47, 0x65, 0x74, 0x47, 0x72, 0x61, 0x70, 0x68, 0x52, 0x65, 0x73, 0x22, 0x00, 0x12, 0x4f,
	0x0a, 0x15, 0x47, 0x65, 0x74, 0x44, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e,
	0x51, 0x75, 0x61, 0x6c, 0x69, 0x74, 0x79, 0x12, 0x19, 0x2e, 0x6b, 0x67, 0x2e, 0x44, 0x65, 0x73,
	0x63, 0x72, 0x69, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x51, 0x75, 0x61, 0x6c, 0x69, 0x74, 0x79, 0x52,
	0x65, 0x71, 0x1a, 0x19, 0x2e, 0x6b, 0x67, 0x2e, 0x44, 0x65, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74,
	0x69, 0x6f, 0x6e, 0x51, 0x75, 0x61, 0x6c, 0x69, 0x74, 0x79, 0x52, 0x65, 0x73, 0x22, 0x00, 0x42,
	0x0c, 0x5a, 0x0a, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x3b, 0x6b, 0x67, 0x70, 0x62, 0x62, 0x06, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_proto_knowledge_graph_proto_rawDescOnce sync.Once
	file_proto_knowledge_graph_proto_rawDescData = file_proto_knowledge_graph_proto_rawDesc
)

func file_proto_knowledge_graph_proto_rawDescGZIP() []byte {
	file_proto_knowledge_graph_proto_rawDescOnce.Do(func() {
		file_proto_knowledge_graph_proto_rawDescData = protoimpl.X.CompressGZIP(file_proto_knowledge_graph_proto_rawDescData)
	})
	return file_proto_knowledge_graph_proto_rawDescData
}

var file_proto_knowledge_graph_proto_msgTypes = make([]protoimpl.MessageInfo, 6)
var file_proto_knowledge_graph_proto_goTypes = []interface{}{
	(*GetGraphReq)(nil),           // 0: kg.GetGraphReq
	(*DescriptionQualityReq)(nil), // 1: kg.DescriptionQualityReq
	(*DescriptionQualityRes)(nil), // 2: kg.DescriptionQualityRes
	(*GraphItem)(nil),             // 3: kg.GraphItem
	(*Topic)(nil),                 // 4: kg.Topic
	(*GetGraphRes)(nil),           // 5: kg.GetGraphRes
}
var file_proto_knowledge_graph_proto_depIdxs = []int32{
	4, // 0: kg.GraphItem.topics:type_name -> kg.Topic
	3, // 1: kg.GetGraphRes.items:type_name -> kg.GraphItem
	4, // 2: kg.GetGraphRes.topics:type_name -> kg.Topic
	0, // 3: kg.KGService.GetGraph:input_type -> kg.GetGraphReq
	1, // 4: kg.KGService.GetDescriptionQuality:input_type -> kg.DescriptionQualityReq
	5, // 5: kg.KGService.GetGraph:output_type -> kg.GetGraphRes
	2, // 6: kg.KGService.GetDescriptionQuality:output_type -> kg.DescriptionQualityRes
	5, // [5:7] is the sub-list for method output_type
	3, // [3:5] is the sub-list for method input_type
	3, // [3:3] is the sub-list for extension type_name
	3, // [3:3] is the sub-list for extension extendee
	0, // [0:3] is the sub-list for field type_name
}

func init() { file_proto_knowledge_graph_proto_init() }
func file_proto_knowledge_graph_proto_init() {
	if File_proto_knowledge_graph_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_proto_knowledge_graph_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetGraphReq); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_knowledge_graph_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DescriptionQualityReq); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_knowledge_graph_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*DescriptionQualityRes); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_knowledge_graph_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GraphItem); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_knowledge_graph_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Topic); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_proto_knowledge_graph_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetGraphRes); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_proto_knowledge_graph_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   6,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_proto_knowledge_graph_proto_goTypes,
		DependencyIndexes: file_proto_knowledge_graph_proto_depIdxs,
		MessageInfos:      file_proto_knowledge_graph_proto_msgTypes,
	}.Build()
	File_proto_knowledge_graph_proto = out.File
	file_proto_knowledge_graph_proto_rawDesc = nil
	file_proto_knowledge_graph_proto_goTypes = nil
	file_proto_knowledge_graph_proto_depIdxs = nil
}
