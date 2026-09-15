import subprocess


def test_single_alembic_head():
    """Two heads make `alembic upgrade head` refuse to run, which takes down CI and the API.

    Shells out because the local alembic/ migrations folder shadows the alembic package.
    """
    out = subprocess.run(["alembic", "heads"], capture_output=True, text=True, check=True).stdout
    heads = [line for line in out.splitlines() if "(head)" in line]
    assert len(heads) == 1, out
