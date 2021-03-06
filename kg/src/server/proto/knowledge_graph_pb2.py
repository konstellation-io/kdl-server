# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: knowledge_graph.proto
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor.FileDescriptor(
  name='knowledge_graph.proto',
  package='kg',
  syntax='proto3',
  serialized_options=b'Z\nproto;kgpb',
  create_key=_descriptor._internal_create_key,
  serialized_pb=b'\n\x15knowledge_graph.proto\x12\x02kg\"\"\n\x0bGetGraphReq\x12\x13\n\x0b\x64\x65scription\x18\x01 \x01(\t\",\n\x15\x44\x65scriptionQualityReq\x12\x13\n\x0b\x64\x65scription\x18\x01 \x01(\t\".\n\x15\x44\x65scriptionQualityRes\x12\x15\n\rquality_score\x18\x01 \x01(\x05\"\xdc\x01\n\tGraphItem\x12\n\n\x02id\x18\x01 \x01(\t\x12\x10\n\x08\x63\x61tegory\x18\x02 \x01(\t\x12\r\n\x05title\x18\x03 \x01(\t\x12\x10\n\x08\x61\x62stract\x18\x04 \x01(\t\x12\x0f\n\x07\x61uthors\x18\x05 \x03(\t\x12\r\n\x05score\x18\x06 \x01(\x02\x12\x0c\n\x04\x64\x61te\x18\x07 \x01(\t\x12\x0b\n\x03url\x18\x08 \x01(\t\x12\x13\n\x0b\x65xternal_id\x18\t \x01(\t\x12\x19\n\x06topics\x18\n \x03(\x0b\x32\t.kg.Topic\x12\x11\n\trepo_urls\x18\x0b \x03(\t\x12\x12\n\nframeworks\x18\x0c \x03(\t\"(\n\x05Topic\x12\x0c\n\x04name\x18\x01 \x01(\t\x12\x11\n\trelevance\x18\x02 \x01(\x02\"F\n\x0bGetGraphRes\x12\x1c\n\x05items\x18\x01 \x03(\x0b\x32\r.kg.GraphItem\x12\x19\n\x06topics\x18\x02 \x03(\x0b\x32\t.kg.Topic2\x8c\x01\n\tKGService\x12.\n\x08GetGraph\x12\x0f.kg.GetGraphReq\x1a\x0f.kg.GetGraphRes\"\x00\x12O\n\x15GetDescriptionQuality\x12\x19.kg.DescriptionQualityReq\x1a\x19.kg.DescriptionQualityRes\"\x00\x42\x0cZ\nproto;kgpbb\x06proto3'
)




_GETGRAPHREQ = _descriptor.Descriptor(
  name='GetGraphReq',
  full_name='kg.GetGraphReq',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='description', full_name='kg.GetGraphReq.description', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=29,
  serialized_end=63,
)


_DESCRIPTIONQUALITYREQ = _descriptor.Descriptor(
  name='DescriptionQualityReq',
  full_name='kg.DescriptionQualityReq',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='description', full_name='kg.DescriptionQualityReq.description', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=65,
  serialized_end=109,
)


_DESCRIPTIONQUALITYRES = _descriptor.Descriptor(
  name='DescriptionQualityRes',
  full_name='kg.DescriptionQualityRes',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='quality_score', full_name='kg.DescriptionQualityRes.quality_score', index=0,
      number=1, type=5, cpp_type=1, label=1,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=111,
  serialized_end=157,
)


_GRAPHITEM = _descriptor.Descriptor(
  name='GraphItem',
  full_name='kg.GraphItem',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='id', full_name='kg.GraphItem.id', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='category', full_name='kg.GraphItem.category', index=1,
      number=2, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='title', full_name='kg.GraphItem.title', index=2,
      number=3, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='abstract', full_name='kg.GraphItem.abstract', index=3,
      number=4, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='authors', full_name='kg.GraphItem.authors', index=4,
      number=5, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='score', full_name='kg.GraphItem.score', index=5,
      number=6, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='date', full_name='kg.GraphItem.date', index=6,
      number=7, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='url', full_name='kg.GraphItem.url', index=7,
      number=8, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='external_id', full_name='kg.GraphItem.external_id', index=8,
      number=9, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='topics', full_name='kg.GraphItem.topics', index=9,
      number=10, type=11, cpp_type=10, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='repo_urls', full_name='kg.GraphItem.repo_urls', index=10,
      number=11, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='frameworks', full_name='kg.GraphItem.frameworks', index=11,
      number=12, type=9, cpp_type=9, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=160,
  serialized_end=380,
)


_TOPIC = _descriptor.Descriptor(
  name='Topic',
  full_name='kg.Topic',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='name', full_name='kg.Topic.name', index=0,
      number=1, type=9, cpp_type=9, label=1,
      has_default_value=False, default_value=b"".decode('utf-8'),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='relevance', full_name='kg.Topic.relevance', index=1,
      number=2, type=2, cpp_type=6, label=1,
      has_default_value=False, default_value=float(0),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=382,
  serialized_end=422,
)


_GETGRAPHRES = _descriptor.Descriptor(
  name='GetGraphRes',
  full_name='kg.GetGraphRes',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  create_key=_descriptor._internal_create_key,
  fields=[
    _descriptor.FieldDescriptor(
      name='items', full_name='kg.GetGraphRes.items', index=0,
      number=1, type=11, cpp_type=10, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
    _descriptor.FieldDescriptor(
      name='topics', full_name='kg.GetGraphRes.topics', index=1,
      number=2, type=11, cpp_type=10, label=3,
      has_default_value=False, default_value=[],
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR,  create_key=_descriptor._internal_create_key),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=424,
  serialized_end=494,
)

_GRAPHITEM.fields_by_name['topics'].message_type = _TOPIC
_GETGRAPHRES.fields_by_name['items'].message_type = _GRAPHITEM
_GETGRAPHRES.fields_by_name['topics'].message_type = _TOPIC
DESCRIPTOR.message_types_by_name['GetGraphReq'] = _GETGRAPHREQ
DESCRIPTOR.message_types_by_name['DescriptionQualityReq'] = _DESCRIPTIONQUALITYREQ
DESCRIPTOR.message_types_by_name['DescriptionQualityRes'] = _DESCRIPTIONQUALITYRES
DESCRIPTOR.message_types_by_name['GraphItem'] = _GRAPHITEM
DESCRIPTOR.message_types_by_name['Topic'] = _TOPIC
DESCRIPTOR.message_types_by_name['GetGraphRes'] = _GETGRAPHRES
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

GetGraphReq = _reflection.GeneratedProtocolMessageType('GetGraphReq', (_message.Message,), {
  'DESCRIPTOR' : _GETGRAPHREQ,
  '__module__' : 'knowledge_graph_pb2'
  # @@protoc_insertion_point(class_scope:kg.GetGraphReq)
  })
_sym_db.RegisterMessage(GetGraphReq)

DescriptionQualityReq = _reflection.GeneratedProtocolMessageType('DescriptionQualityReq', (_message.Message,), {
  'DESCRIPTOR' : _DESCRIPTIONQUALITYREQ,
  '__module__' : 'knowledge_graph_pb2'
  # @@protoc_insertion_point(class_scope:kg.DescriptionQualityReq)
  })
_sym_db.RegisterMessage(DescriptionQualityReq)

DescriptionQualityRes = _reflection.GeneratedProtocolMessageType('DescriptionQualityRes', (_message.Message,), {
  'DESCRIPTOR' : _DESCRIPTIONQUALITYRES,
  '__module__' : 'knowledge_graph_pb2'
  # @@protoc_insertion_point(class_scope:kg.DescriptionQualityRes)
  })
_sym_db.RegisterMessage(DescriptionQualityRes)

GraphItem = _reflection.GeneratedProtocolMessageType('GraphItem', (_message.Message,), {
  'DESCRIPTOR' : _GRAPHITEM,
  '__module__' : 'knowledge_graph_pb2'
  # @@protoc_insertion_point(class_scope:kg.GraphItem)
  })
_sym_db.RegisterMessage(GraphItem)

Topic = _reflection.GeneratedProtocolMessageType('Topic', (_message.Message,), {
  'DESCRIPTOR' : _TOPIC,
  '__module__' : 'knowledge_graph_pb2'
  # @@protoc_insertion_point(class_scope:kg.Topic)
  })
_sym_db.RegisterMessage(Topic)

GetGraphRes = _reflection.GeneratedProtocolMessageType('GetGraphRes', (_message.Message,), {
  'DESCRIPTOR' : _GETGRAPHRES,
  '__module__' : 'knowledge_graph_pb2'
  # @@protoc_insertion_point(class_scope:kg.GetGraphRes)
  })
_sym_db.RegisterMessage(GetGraphRes)


DESCRIPTOR._options = None

_KGSERVICE = _descriptor.ServiceDescriptor(
  name='KGService',
  full_name='kg.KGService',
  file=DESCRIPTOR,
  index=0,
  serialized_options=None,
  create_key=_descriptor._internal_create_key,
  serialized_start=497,
  serialized_end=637,
  methods=[
  _descriptor.MethodDescriptor(
    name='GetGraph',
    full_name='kg.KGService.GetGraph',
    index=0,
    containing_service=None,
    input_type=_GETGRAPHREQ,
    output_type=_GETGRAPHRES,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
  _descriptor.MethodDescriptor(
    name='GetDescriptionQuality',
    full_name='kg.KGService.GetDescriptionQuality',
    index=1,
    containing_service=None,
    input_type=_DESCRIPTIONQUALITYREQ,
    output_type=_DESCRIPTIONQUALITYRES,
    serialized_options=None,
    create_key=_descriptor._internal_create_key,
  ),
])
_sym_db.RegisterServiceDescriptor(_KGSERVICE)

DESCRIPTOR.services_by_name['KGService'] = _KGSERVICE

# @@protoc_insertion_point(module_scope)
