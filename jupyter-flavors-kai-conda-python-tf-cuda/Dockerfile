ARG IMAGE_NAME
FROM ${IMAGE_NAME}:{{ cuda.version.release_label }}-base-{{ cuda.os.distro }}{{ cuda.os.version }}{{ cuda.image_tag_suffix if "image_tag_suffix" in cuda }} as base

ENV NV_CUDA_LIB_VERSION {{ cuda.version.release_label + "-1" }}

{% if "x86_64" in cuda %}
FROM base as base-amd64

ENV NV_NVTX_VERSION {{ cuda.x86_64.components.nvtx.version }}
{% if "libnpp" in cuda.x86_64.components %}
    {% set has_libnpp_package = true %}
ENV NV_LIBNPP_VERSION {{ cuda.x86_64.components.libnpp.version }}
ENV NV_LIBNPP_PACKAGE libnpp-{{ cuda.version.major }}-{{ cuda.version.minor }}=${NV_LIBNPP_VERSION}
{% endif %}
ENV NV_LIBCUSPARSE_VERSION {{ cuda.x86_64.components.libcusparse.version }}

ENV NV_LIBCUBLAS_PACKAGE_NAME libcublas-{{ cuda.version.major }}-{{ cuda.version.minor }}
ENV NV_LIBCUBLAS_VERSION {{ cuda.x86_64.components.libcublas.version }}
ENV NV_LIBCUBLAS_PACKAGE ${NV_LIBCUBLAS_PACKAGE_NAME}=${NV_LIBCUBLAS_VERSION}

{% if "libnccl2" in cuda.x86_64.components and cuda.x86_64.components.libnccl2 %}
    {% set has_libnccl_package = true %}
ENV NV_LIBNCCL_PACKAGE_NAME libnccl2
ENV NV_LIBNCCL_PACKAGE_VERSION {{ cuda.x86_64.components.libnccl2_dev.version }}
ENV NCCL_VERSION {{ cuda.x86_64.components.libnccl2_dev.version }}
ENV NV_LIBNCCL_PACKAGE ${NV_LIBNCCL_PACKAGE_NAME}=${NV_LIBNCCL_PACKAGE_VERSION}+cuda{{ cuda.version.major }}.{{ cuda.version.minor }}

{% endif -%}

{% endif %}
{% if "arm64" in cuda %}
FROM base as base-arm64

ENV NV_NVTX_VERSION {{ cuda.arm64.components.nvtx.version }}
{% if "libnpp" in cuda.arm64.components %}
    {% set has_libnpp_package = true %}
ENV NV_LIBNPP_VERSION {{ cuda.arm64.components.libnpp.version }}
ENV NV_LIBNPP_PACKAGE libnpp-{{ cuda.version.major }}-{{ cuda.version.minor }}=${NV_LIBNPP_VERSION}
{% endif %}
ENV NV_LIBCUSPARSE_VERSION {{ cuda.arm64.components.libcusparse.version }}

{% if cuda.flavor == "l4t" %}
    {% if cuda.version.major | int == 10 %}
ENV NV_LIBCUBLAS_PACKAGE_NAME libcublas10
    {% else %}
ENV NV_LIBCUBLAS_PACKAGE_NAME libcublas-{{ cuda.version.major }}-{{ cuda.version.minor }}
    {% endif %}
{% else %}
ENV NV_LIBCUBLAS_PACKAGE_NAME libcublas-{{ cuda.version.major }}-{{ cuda.version.minor }}
{% endif %}
ENV NV_LIBCUBLAS_VERSION {{ cuda.arm64.components.libcublas.version }}
ENV NV_LIBCUBLAS_PACKAGE ${NV_LIBCUBLAS_PACKAGE_NAME}=${NV_LIBCUBLAS_VERSION}

{% if "libnccl2" in cuda.arm64.components and cuda.arm64.components.libnccl2 %}
    {% set has_libnccl_package = true %}
ENV NV_LIBNCCL_PACKAGE_NAME libnccl2
ENV NV_LIBNCCL_PACKAGE_VERSION {{ cuda.arm64.components.libnccl2_dev.version }}
ENV NCCL_VERSION {{ cuda.arm64.components.libnccl2_dev.version }}
ENV NV_LIBNCCL_PACKAGE ${NV_LIBNCCL_PACKAGE_NAME}=${NV_LIBNCCL_PACKAGE_VERSION}+cuda{{ cuda.version.major }}.{{ cuda.version.minor }}

{% endif %}
{% endif -%}

{% if "ppc64le" in cuda %}
FROM base as base-ppc64le

ENV NV_NVTX_VERSION {{ cuda.ppc64le.components.nvtx.version }}
{% if "libnpp" in cuda.ppc64le.components %}
    {% set has_libnpp_package = true %}
ENV NV_LIBNPP_VERSION {{ cuda.ppc64le.components.libnpp.version }}
ENV NV_LIBNPP_PACKAGE libnpp-{{ cuda.version.major }}-{{ cuda.version.minor }}=${NV_LIBNPP_VERSION}
{% endif %}
ENV NV_LIBCUSPARSE_VERSION {{ cuda.ppc64le.components.libcusparse.version }}

ENV NV_LIBCUBLAS_PACKAGE_NAME libcublas-{{ cuda.version.major }}-{{ cuda.version.minor }}
ENV NV_LIBCUBLAS_VERSION {{ cuda.ppc64le.components.libcublas.version }}
ENV NV_LIBCUBLAS_PACKAGE ${NV_LIBCUBLAS_PACKAGE_NAME}=${NV_LIBCUBLAS_VERSION}

{% if "libnccl2" in cuda.ppc64le.components and cuda.ppc64le.components.libnccl2 %}
    {% set has_libnccl_package = true %}
ENV NV_LIBNCCL_PACKAGE_NAME libnccl2
ENV NV_LIBNCCL_PACKAGE_VERSION {{ cuda.ppc64le.components.libnccl2_dev.version }}
ENV NCCL_VERSION {{ cuda.ppc64le.components.libnccl2_dev.version }}
ENV NV_LIBNCCL_PACKAGE ${NV_LIBNCCL_PACKAGE_NAME}=${NV_LIBNCCL_PACKAGE_VERSION}+cuda{{ cuda.version.major }}.{{ cuda.version.minor }}

{% endif %}
{% endif -%}

FROM base-${TARGETARCH}

ARG TARGETARCH

LABEL maintainer "NVIDIA CORPORATION <cudatools@nvidia.com>"

RUN apt-get update && apt-get install -y --no-install-recommends \
    cuda-libraries-{{ cuda.version.major }}-{{ cuda.version.minor }}=${NV_CUDA_LIB_VERSION} \
    {% if has_libnpp_package %}
    ${NV_LIBNPP_PACKAGE} \
    {% endif %}
    cuda-nvtx-{{ cuda.version.major }}-{{ cuda.version.minor }}=${NV_NVTX_VERSION} \
    libcusparse-{{ cuda.version.major }}-{{ cuda.version.minor }}=${NV_LIBCUSPARSE_VERSION} \
    ${NV_LIBCUBLAS_PACKAGE} \
    {% if has_libnccl_package %}
    ${NV_LIBNCCL_PACKAGE} \
    {% endif %}
    && rm -rf /var/lib/apt/lists/*

# Keep apt from auto upgrading the cublas and nccl packages. See https://gitlab.com/nvidia/container-images/cuda/-/issues/88
RUN apt-mark hold ${NV_LIBCUBLAS_PACKAGE_NAME}{% if has_libnccl_package %} ${NV_LIBNCCL_PACKAGE_NAME}{% endif %}
