"""Add created_at to point_transactions

Revision ID: 27cb60955bd5
Revises: 7e08677e99ea
Create Date: 2025-09-30 15:46:45.785859

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '27cb60955bd5'
down_revision: Union[str, Sequence[str], None] = '7e08677e99ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add 'created_at' with a default for existing rows
    op.add_column(
        'point_transactions',
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.text('NOW()')  # default for existing rows
        )
    )

    # Drop old 'timestamp' column
    op.drop_column('point_transactions', 'timestamp')

    # Remove the server default so SQLAlchemy handles it for new inserts
    op.alter_column('point_transactions', 'created_at', server_default=None)


def downgrade() -> None:
    """Downgrade schema."""
    # Recreate 'timestamp' column
    op.add_column(
        'point_transactions',
        sa.Column(
            'timestamp',
            postgresql.TIMESTAMP(),
            autoincrement=False,
            nullable=True
        )
    )

    # Drop 'created_at' column
    op.drop_column('point_transactions', 'created_at')
