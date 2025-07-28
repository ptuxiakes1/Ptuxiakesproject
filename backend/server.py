from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import uuid
import hashlib
import base64
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str  # student, supervisor, admin
    password_hash: str
    profile_pic: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    active: bool = True

class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

class EssayRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    title: str
    due_date: datetime
    word_count: int
    assignment_type: str  # essay, dissertation_qualitative, dissertation_quantitative, statistical_analysis, paraphrase, ai_detection, translation
    field_of_study: str  # engineering, etc.
    attachments: List[str] = []  # base64 encoded files
    extra_information: Optional[str] = None
    status: str = "pending"  # pending, accepted, rejected, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    assigned_supervisor: Optional[str] = None

class EssayRequestCreate(BaseModel):
    title: str
    due_date: datetime
    word_count: int
    assignment_type: str
    field_of_study: str
    attachments: List[str] = []
    extra_information: Optional[str] = None

class Bid(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    supervisor_id: str
    request_id: str
    price: float
    notes: str
    status: str = "pending"  # pending, accepted, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SystemSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    site_title: str = "Essay Bid Submission System"
    login_title: str = "Essay Bid Submission System"  # Configurable login page title
    site_description: str = "Professional essay writing and bidding platform"
    header_color: str = "#1e3a8a"  # Default blue
    header_text_color: str = "#ffffff"  # Default white
    meta_keywords: str = "essay, writing, academic, bidding, students, supervisors"
    meta_description: str = "Professional essay writing and bidding platform connecting students with qualified supervisors"
    favicon_url: Optional[str] = None
    logo_url: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    request_id: str  # Changed from bid_id to request_id
    bid_id: Optional[str] = None  # Keep as optional for backward compatibility
    payment_method: str  # "IBAN", "PayPal", "Stripe", "Custom"
    payment_details: str  # IBAN number, PayPal email, Stripe link, or custom info
    instructions: Optional[str] = None  # Additional payment instructions
    created_by_admin: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentInfoCreate(BaseModel):
    student_id: str
    request_id: str  # Changed from bid_id to request_id
    bid_id: Optional[str] = None  # Keep as optional
    payment_method: str
    payment_details: str
    instructions: Optional[str] = None

class SystemSettingsUpdate(BaseModel):
    site_title: Optional[str] = None
    login_title: Optional[str] = None  # Allow updating login page title
    site_description: Optional[str] = None
    header_color: Optional[str] = None
    header_text_color: Optional[str] = None
    meta_keywords: Optional[str] = None
    meta_description: Optional[str] = None
    favicon_url: Optional[str] = None
    logo_url: Optional[str] = None

class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    question: str
    category: str
    status: str = "pending"  # pending, answered, closed
    answer: Optional[str] = None
    answered_by: Optional[str] = None
    answered_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuestionCreate(BaseModel):
    title: str
    question: str
    category: str

class QuestionAnswer(BaseModel):
    answer: str

class BidCreate(BaseModel):
    request_id: str
    price: float
    notes: str

class AdminPrice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_id: str
    price: float
    set_by_admin: str
    visible_to_student: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminPriceCreate(BaseModel):
    request_id: str
    price: float

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_id: str
    sender_id: str
    receiver_id: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False
    approved: bool = False
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None

class ChatMessageCreate(BaseModel):
    request_id: str
    receiver_id: str
    message: str

class AdminSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    google_oauth_enabled: bool = False
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    emergent_auth_enabled: bool = True
    email_notifications_enabled: bool = False
    email_service_provider: Optional[str] = None  # sendgrid, mailgun, etc
    email_api_key: Optional[str] = None
    system_language: str = "en"  # en, gr
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AdminSettingsUpdate(BaseModel):
    google_oauth_enabled: Optional[bool] = None
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    emergent_auth_enabled: Optional[bool] = None
    email_notifications_enabled: Optional[bool] = None
    email_service_provider: Optional[str] = None
    email_api_key: Optional[str] = None
    system_language: Optional[str] = None

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str  # bid_received, status_change, assignment_update, etc
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Utility functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed_password: str) -> bool:
    return hash_password(password) == hashed_password

# Authentication middleware
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user = await db.users.find_one({"id": token})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return User(**user)

# Admin only middleware
async def admin_only(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

# Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user_data.dict()
    user_dict["password_hash"] = hash_password(user_data.password)
    del user_dict["password"]
    
    user = User(**user_dict)
    await db.users.insert_one(user.dict())
    
    # Return token (user ID for simplicity)
    return {"token": user.id, "user": {"id": user.id, "email": user.email, "name": user.name, "role": user.role}}

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    return {"token": user["id"], "user": {"id": user["id"], "email": user["email"], "name": user["name"], "role": user["role"]}}

@api_router.get("/auth/me")
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

# Essay requests
@api_router.post("/requests", response_model=EssayRequest)
async def create_essay_request(request_data: EssayRequestCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create essay requests"
        )
    
    request_dict = request_data.dict()
    request_dict["student_id"] = current_user.id
    
    essay_request = EssayRequest(**request_dict)
    await db.essay_requests.insert_one(essay_request.dict())
    
    # Create notification for all supervisors
    supervisors = await db.users.find({"role": "supervisor"}).to_list(None)
    for supervisor in supervisors:
        notification = Notification(
            user_id=supervisor["id"],
            title="New Essay Request",
            message=f"New essay request: {essay_request.title}",
            type="new_request"
        )
        await db.notifications.insert_one(notification.dict())
    
    return essay_request

@api_router.get("/requests", response_model=List[EssayRequest])
async def get_essay_requests(
    search: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    query = {}
    
    if current_user.role == "student":
        # Students can only see their own requests
        query["student_id"] = current_user.id
    elif current_user.role == "supervisor":
        # Supervisors can see all pending requests
        query["status"] = "pending"
    # Admins can see all requests (no additional filter)
    
    # Add search filter
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"field_of_study": {"$regex": search, "$options": "i"}},
            {"assignment_type": {"$regex": search, "$options": "i"}}
        ]
    
    # Add category filter
    if category:
        query["field_of_study"] = category
    
    # Get requests and sort by latest first
    requests = await db.essay_requests.find(query).sort("created_at", -1).to_list(None)
    
    return [EssayRequest(**request) for request in requests]

@api_router.get("/requests/assigned", response_model=List[EssayRequest])
async def get_assigned_requests(current_user: User = Depends(get_current_user)):
    if current_user.role == "student":
        # Students can see their assigned requests
        requests = await db.essay_requests.find({
            "student_id": current_user.id,
            "status": "accepted",
            "assigned_supervisor": {"$ne": None}
        }).to_list(None)
    elif current_user.role == "supervisor":
        # Supervisors can see requests assigned to them
        requests = await db.essay_requests.find({
            "assigned_supervisor": current_user.id,
            "status": "accepted"
        }).to_list(None)
    else:  # admin
        # Admins can see all assigned requests
        requests = await db.essay_requests.find({
            "status": "accepted",
            "assigned_supervisor": {"$ne": None}
        }).to_list(None)
    
    return [EssayRequest(**request) for request in requests]

@api_router.get("/requests/{request_id}", response_model=EssayRequest)
async def get_essay_request(request_id: str, current_user: User = Depends(get_current_user)):
    request = await db.essay_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Check permissions
    if current_user.role == "student" and request["student_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "supervisor" and request["status"] != "pending" and request.get("assigned_supervisor") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return EssayRequest(**request)

@api_router.put("/requests/{request_id}")
async def update_essay_request(request_id: str, request_data: EssayRequestCreate, current_user: User = Depends(get_current_user)):
    request = await db.essay_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Check permissions
    if current_user.role == "student" and request["student_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role != "admin" and current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update request
    update_data = request_data.dict()
    update_data["due_date"] = update_data["due_date"].isoformat() if isinstance(update_data["due_date"], datetime) else update_data["due_date"]
    
    await db.essay_requests.update_one(
        {"id": request_id},
        {"$set": update_data}
    )
    
    return {"message": "Request updated successfully"}

@api_router.delete("/requests/{request_id}")
async def delete_essay_request(request_id: str, current_user: User = Depends(admin_only)):
    await db.essay_requests.delete_one({"id": request_id})
    return {"message": "Request deleted successfully"}

@api_router.put("/requests/{request_id}/assign")
async def assign_request_to_supervisor(request_id: str, supervisor_id: str, current_user: User = Depends(admin_only)):
    # Check if supervisor exists
    supervisor = await db.users.find_one({"id": supervisor_id, "role": "supervisor"})
    if not supervisor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supervisor not found"
        )
    
    # Update request
    await db.essay_requests.update_one(
        {"id": request_id},
        {"$set": {"assigned_supervisor": supervisor_id, "status": "accepted"}}
    )
    
    # Create notification for supervisor
    notification = Notification(
        user_id=supervisor_id,
        title="New Assignment",
        message=f"You have been assigned a new essay request",
        type="assignment"
    )
    await db.notifications.insert_one(notification.dict())
    
    return {"message": "Request assigned successfully"}

# Bidding system (updated - only admins can see bids)
@api_router.post("/bids", response_model=Bid)
async def create_bid(bid_data: BidCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "supervisor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only supervisors can create bids"
        )
    
    # Check if request exists and is pending
    request = await db.essay_requests.find_one({"id": bid_data.request_id})
    if not request or request["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request not found or not available for bidding"
        )
    
    bid_dict = bid_data.dict()
    bid_dict["supervisor_id"] = current_user.id
    
    bid = Bid(**bid_dict)
    await db.bids.insert_one(bid.dict())
    
    # Notify admins about new bid (students don't get notified)
    admins = await db.users.find({"role": "admin"}).to_list(None)
    for admin in admins:
        notification = Notification(
            user_id=admin["id"],
            title="New Bid Submitted",
            message=f"New bid submitted by {current_user.name} for '{request['title']}'",
            type="bid_submitted"
        )
        await db.notifications.insert_one(notification.dict())
    
    return bid

@api_router.get("/bids", response_model=List[Bid])
async def get_bids(current_user: User = Depends(get_current_user)):
    if current_user.role == "supervisor":
        # Supervisors can only see their own bids
        bids = await db.bids.find({"supervisor_id": current_user.id}).to_list(None)
    elif current_user.role == "admin":
        # Only admins can see all bids
        bids = await db.bids.find().to_list(None)
    else:
        # Students cannot see bids at all
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return [Bid(**bid) for bid in bids]

@api_router.get("/bids/request/{request_id}", response_model=List[Bid])
async def get_bids_for_request(request_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view bids for requests"
        )
    
    bids = await db.bids.find({"request_id": request_id}).to_list(None)
    return [Bid(**bid) for bid in bids]

@api_router.put("/bids/{bid_id}/status")
async def update_bid_status(bid_id: str, status_value: str, current_user: User = Depends(admin_only)):
    if status_value not in ["pending", "accepted", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )
    
    bid = await db.bids.find_one({"id": bid_id})
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )
    
    # Update bid status
    await db.bids.update_one({"id": bid_id}, {"$set": {"status": status_value}})
    
    # Update essay request if bid is accepted
    if status_value == "accepted":
        await db.essay_requests.update_one(
            {"id": bid["request_id"]}, 
            {"$set": {"status": "accepted", "assigned_supervisor": bid["supervisor_id"]}}
        )
        
        # Reject other bids for this request
        await db.bids.update_many(
            {"request_id": bid["request_id"], "id": {"$ne": bid_id}},
            {"$set": {"status": "rejected"}}
        )
    
    # Notify supervisor
    notification = Notification(
        user_id=bid["supervisor_id"],
        title="Bid Status Updated",
        message=f"Your bid has been {status_value}",
        type="bid_status_update"
    )
    await db.notifications.insert_one(notification.dict())
    
    return {"message": "Bid status updated successfully"}

# Chat system with admin approval
@api_router.post("/chat/send", response_model=ChatMessage)
async def send_message(message_data: ChatMessageCreate, current_user: User = Depends(get_current_user)):
    # Check if request exists and user has permission to chat
    request = await db.essay_requests.find_one({"id": message_data.request_id})
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Allow chat for assigned requests (accepted status)
    if request["status"] != "accepted" or not request.get("assigned_supervisor"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat is only available for assigned requests"
        )
    
    # Check permissions
    if current_user.role == "student" and request["student_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "supervisor" and request["assigned_supervisor"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    message_dict = message_data.dict()
    message_dict["sender_id"] = current_user.id
    message_dict["approved"] = False  # Messages need admin approval
    
    message = ChatMessage(**message_dict)
    await db.chat_messages.insert_one(message.dict())
    
    # Notify admin about new message that needs approval
    admins = await db.users.find({"role": "admin"}).to_list(None)
    for admin in admins:
        notification = Notification(
            user_id=admin["id"],
            title="Message Needs Approval",
            message=f"New message from {current_user.name} needs approval for request: {request['title']}",
            type="message_approval"
        )
        await db.notifications.insert_one(notification.dict())
    
    return message

@api_router.get("/chat/{request_id}", response_model=List[ChatMessage])
async def get_chat_messages(request_id: str, current_user: User = Depends(get_current_user)):
    # Check permissions
    request = await db.essay_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    if current_user.role == "student" and request["student_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    elif current_user.role == "supervisor" and request.get("assigned_supervisor") != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Students and supervisors only see approved messages
    if current_user.role in ["student", "supervisor"]:
        messages = await db.chat_messages.find({"request_id": request_id, "approved": True}).sort("timestamp", 1).to_list(None)
    else:  # Admin sees all messages
        messages = await db.chat_messages.find({"request_id": request_id}).sort("timestamp", 1).to_list(None)
    
    return [ChatMessage(**message) for message in messages]

@api_router.get("/admin/messages/pending", response_model=List[ChatMessage])
async def get_pending_messages(current_user: User = Depends(admin_only)):
    messages = await db.chat_messages.find({"approved": False}).sort("timestamp", 1).to_list(None)
    return [ChatMessage(**message) for message in messages]

@api_router.put("/admin/messages/{message_id}/approve")
async def approve_message(message_id: str, current_user: User = Depends(admin_only)):
    message = await db.chat_messages.find_one({"id": message_id})
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Approve message
    await db.chat_messages.update_one(
        {"id": message_id},
        {"$set": {"approved": True, "approved_by": current_user.id, "approved_at": datetime.utcnow()}}
    )
    
    # Notify receiver about approved message
    notification = Notification(
        user_id=message["receiver_id"],
        title="New Message",
        message=f"You have a new message in your chat",
        type="message_approved"
    )
    await db.notifications.insert_one(notification.dict())
    
    return {"message": "Message approved successfully"}

@api_router.delete("/admin/messages/{message_id}")
async def delete_message(message_id: str, current_user: User = Depends(admin_only)):
    await db.chat_messages.delete_one({"id": message_id})
    return {"message": "Message deleted successfully"}

# Notifications
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": current_user.id}).sort("created_at", -1).to_list(None)
    return [Notification(**notification) for notification in notifications]

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

# Admin settings
@api_router.get("/admin/settings", response_model=AdminSettings)
async def get_admin_settings(current_user: User = Depends(admin_only)):
    settings = await db.admin_settings.find_one()
    if not settings:
        # Create default settings
        default_settings = AdminSettings()
        await db.admin_settings.insert_one(default_settings.dict())
        return default_settings
    
    return AdminSettings(**settings)

@api_router.put("/admin/settings")
async def update_admin_settings(settings_data: AdminSettingsUpdate, current_user: User = Depends(admin_only)):
    current_settings = await db.admin_settings.find_one()
    
    if not current_settings:
        # Create default settings first
        default_settings = AdminSettings()
        await db.admin_settings.insert_one(default_settings.dict())
        current_settings = default_settings.dict()
    
    # Update only provided fields
    update_data = {k: v for k, v in settings_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.admin_settings.update_one(
        {"id": current_settings["id"]},
        {"$set": update_data}
    )
    
    return {"message": "Settings updated successfully"}

# Admin price management
@api_router.post("/admin/prices", response_model=AdminPrice)
async def set_admin_price(price_data: AdminPriceCreate, current_user: User = Depends(admin_only)):
    # Check if request exists
    request = await db.essay_requests.find_one({"id": price_data.request_id})
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    price_dict = price_data.dict()
    price_dict["set_by_admin"] = current_user.id
    
    admin_price = AdminPrice(**price_dict)
    await db.admin_prices.insert_one(admin_price.dict())
    
    # Notify student about admin price
    notification = Notification(
        user_id=request["student_id"],
        title="Admin Set Price",
        message=f"Admin set price ${admin_price.price} for your request: {request['title']}",
        type="admin_price"
    )
    await db.notifications.insert_one(notification.dict())
    
    return admin_price

@api_router.get("/admin/prices", response_model=List[AdminPrice])
async def get_admin_prices(current_user: User = Depends(admin_only)):
    prices = await db.admin_prices.find().to_list(None)
    return [AdminPrice(**price) for price in prices]

@api_router.get("/prices/request/{request_id}", response_model=List[AdminPrice])
async def get_request_prices(request_id: str, current_user: User = Depends(get_current_user)):
    # Check if request exists and user has permission
    request = await db.essay_requests.find_one({"id": request_id})
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Students can only see prices for their own requests
    if current_user.role == "student" and request["student_id"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    prices = await db.admin_prices.find({"request_id": request_id, "visible_to_student": True}).to_list(None)
    return [AdminPrice(**price) for price in prices]

@api_router.delete("/admin/prices/{price_id}")
async def delete_admin_price(price_id: str, current_user: User = Depends(admin_only)):
    await db.admin_prices.delete_one({"id": price_id})
    return {"message": "Price deleted successfully"}
# System settings management
@api_router.get("/admin/system-settings", response_model=SystemSettings)
async def get_system_settings(current_user: User = Depends(admin_only)):
    settings = await db.system_settings.find_one()
    if not settings:
        # Create default settings
        default_settings = SystemSettings()
        await db.system_settings.insert_one(default_settings.dict())
        return default_settings
    
    return SystemSettings(**settings)

@api_router.put("/admin/system-settings")
async def update_system_settings(settings_data: SystemSettingsUpdate, current_user: User = Depends(admin_only)):
    current_settings = await db.system_settings.find_one()
    
    if not current_settings:
        # Create default settings first
        default_settings = SystemSettings()
        await db.system_settings.insert_one(default_settings.dict())
        current_settings = default_settings.dict()
    
    # Update only provided fields
    update_data = {k: v for k, v in settings_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.system_settings.update_one(
        {"id": current_settings["id"]},
        {"$set": update_data}
    )
    
    return {"message": "System settings updated successfully"}

# Q&A System
@api_router.post("/questions", response_model=Question)
async def create_question(question_data: QuestionCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["student", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students and supervisors can create questions"
        )
    
    question_dict = question_data.dict()
    question_dict["user_id"] = current_user.id
    
    question = Question(**question_dict)
    await db.questions.insert_one(question.dict())
    
    # Notify admins
    admins = await db.users.find({"role": "admin"}).to_list(None)
    for admin in admins:
        notification = Notification(
            user_id=admin["id"],
            title="New Question",
            message=f"New question from {current_user.name}: {question.title}",
            type="new_question"
        )
        await db.notifications.insert_one(notification.dict())
    
    return question

@api_router.get("/questions", response_model=List[Question])
async def get_questions(current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        # Admins can see all questions, sorted by latest
        questions = await db.questions.find().sort("created_at", -1).to_list(None)
    else:
        # Students and supervisors can only see their own questions
        questions = await db.questions.find({"user_id": current_user.id}).sort("created_at", -1).to_list(None)
    
    return [Question(**question) for question in questions]

@api_router.put("/admin/questions/{question_id}/answer")
async def answer_question(question_id: str, answer_data: QuestionAnswer, current_user: User = Depends(admin_only)):
    question = await db.questions.find_one({"id": question_id})
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    # Update question with answer
    await db.questions.update_one(
        {"id": question_id},
        {"$set": {
            "answer": answer_data.answer,
            "answered_by": current_user.id,
            "answered_at": datetime.utcnow(),
            "status": "answered"
        }}
    )
    
    # Notify the question asker
    notification = Notification(
        user_id=question["user_id"],
        title="Question Answered",
        message=f"Your question '{question['title']}' has been answered",
        type="question_answered"
    )
    await db.notifications.insert_one(notification.dict())
    
    return {"message": "Question answered successfully"}

@api_router.delete("/admin/questions/{question_id}")
async def delete_question(question_id: str, current_user: User = Depends(admin_only)):
    await db.questions.delete_one({"id": question_id})
    return {"message": "Question deleted successfully"}

# Forgot password (basic implementation)
@api_router.post("/auth/forgot-password")
async def forgot_password(email: str):
    user = await db.users.find_one({"email": email})
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a reset link will be sent"}
    
    # In a real implementation, you would:
    # 1. Generate a secure token
    # 2. Store it in database with expiration
    # 3. Send email with reset link
    # For now, we'll just return success
    
    return {"message": "Password reset instructions sent to email"}

# Get categories for filtering
@api_router.get("/categories")
async def get_categories(current_user: User = Depends(get_current_user)):
    # Get unique field_of_study values from requests
    categories = await db.essay_requests.distinct("field_of_study")
    return {"categories": categories}

# User management (admin only)
@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(current_user: User = Depends(admin_only)):
    users = await db.users.find().to_list(None)
    return [User(**user) for user in users]

@api_router.post("/admin/users", response_model=User)
async def create_user(user_data: UserCreate, current_user: User = Depends(admin_only)):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user_data.dict()
    user_dict["password_hash"] = hash_password(user_data.password)
    del user_dict["password"]
    
    user = User(**user_dict)
    await db.users.insert_one(user.dict())
    
    return user

@api_router.put("/admin/users/{user_id}")
async def update_user(user_id: str, user_data: UserCreate, current_user: User = Depends(admin_only)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user data
    update_data = user_data.dict()
    if update_data.get("password"):
        update_data["password_hash"] = hash_password(update_data["password"])
        del update_data["password"]
    
    await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    return {"message": "User updated successfully"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(admin_only)):
    await db.users.delete_one({"id": user_id})
    return {"message": "User deleted successfully"}

@api_router.get("/admin/supervisors", response_model=List[User])
async def get_all_supervisors(current_user: User = Depends(admin_only)):
    supervisors = await db.users.find({"role": "supervisor"}).to_list(None)
    return [User(**supervisor) for supervisor in supervisors]

# Payment information management
@api_router.post("/admin/payments", response_model=PaymentInfo)
async def create_payment_info(payment_data: PaymentInfoCreate, current_user: User = Depends(admin_only)):
    # Check if bid exists
    bid = await db.bids.find_one({"id": payment_data.bid_id})
    if not bid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bid not found"
        )
    
    # Check if payment info already exists for this bid
    existing_payment = await db.payment_info.find_one({"bid_id": payment_data.bid_id})
    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment information already exists for this bid"
        )
    
    payment_dict = payment_data.dict()
    payment_dict["created_by_admin"] = current_user.id
    
    payment_info = PaymentInfo(**payment_dict)
    await db.payment_info.insert_one(payment_info.dict())
    
    return payment_info

@api_router.get("/admin/payments", response_model=List[PaymentInfo])
async def get_all_payment_info(current_user: User = Depends(admin_only)):
    payments = await db.payment_info.find().to_list(None)
    return [PaymentInfo(**payment) for payment in payments]

@api_router.get("/payments/student/{student_id}", response_model=List[PaymentInfo])
async def get_student_payment_info(student_id: str, current_user: User = Depends(get_current_user)):
    # Students can only see their own payment info
    if current_user.role == "student" and current_user.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    payments = await db.payment_info.find({"student_id": student_id}).to_list(None)
    return [PaymentInfo(**payment) for payment in payments]

@api_router.get("/payments/bid/{bid_id}", response_model=PaymentInfo)
async def get_payment_info_by_bid(bid_id: str, current_user: User = Depends(get_current_user)):
    payment = await db.payment_info.find_one({"bid_id": bid_id})
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment information not found"
        )
    
    # Check permissions
    if current_user.role == "student":
        if payment["student_id"] != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    return PaymentInfo(**payment)

@api_router.put("/admin/payments/{payment_id}")
async def update_payment_info(payment_id: str, payment_data: PaymentInfoCreate, current_user: User = Depends(admin_only)):
    payment = await db.payment_info.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment information not found"
        )
    
    update_data = payment_data.dict()
    await db.payment_info.update_one(
        {"id": payment_id},
        {"$set": update_data}
    )
    
    return {"message": "Payment information updated successfully"}

@api_router.delete("/admin/payments/{payment_id}")
async def delete_payment_info(payment_id: str, current_user: User = Depends(admin_only)):
    await db.payment_info.delete_one({"id": payment_id})
    return {"message": "Payment information deleted successfully"}

# File upload
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # Read file content and convert to base64
    content = await file.read()
    base64_content = base64.b64encode(content).decode('utf-8')
    
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "data": base64_content
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()