# app/models/admin_notification_status.py
from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AdminNotificationStatus(Base):
    __tablename__ = "admin_notification_status"

    id = Column(Integer, primary_key=True, index=True)
    point_transaction_id = Column(Integer, ForeignKey("point_transactions.id"), unique=True)
    seen = Column(Boolean, default=False)

    transaction = relationship("PointTransaction", backref="admin_notification_status")
