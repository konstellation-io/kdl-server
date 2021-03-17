class VectorSizeException(Exception):
    pass


def check_vector_size(vectors, inputs):
    try:
        vecs_size = vectors.shape[0]
        input_size = inputs.shape[0]
        assert  input_size == vecs_size
    except AssertionError:
        message = f"Vectors ({vecs_size}) " \
                  f"is not the same as the input size ({input_size})"
        raise VectorSizeException(message)
