from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from db.supabase import supabase
from core.security import get_password_hash, verify_password, create_access_token
from dependencies.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/auth", tags=["auth"])

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel) :
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

@router.post("/register", response_model=dict)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = supabase.table("users").select("*").eq("email", user_data.email).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # Default role is 'user'
    new_user = {
        "email": user_data.email,
        "password": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "role": "user"
    }
    
    res = supabase.table("users").insert(new_user).execute()
    return {"message": "User registered successfully", "id": res.data[0]["id"]}

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    # Use .execute() instead of .single() to handle "user not found" without crashing
    res = supabase.table("users").select("*").eq("email", credentials.email).execute()
    user = res.data[0] if res.data else None
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        
    access_token = create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"]
        }
    }

@router.post("/register-admin", response_model=dict)
async def register_admin(user_data: UserRegister, current_admin: dict = Depends(get_current_admin)):
    existing_user = supabase.table("users").select("*").eq("email", user_data.email).execute()
    if existing_user.data:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_admin = {
        "email": user_data.email,
        "password": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "role": "admin"
    }
    
    res = supabase.table("users").insert(new_admin).execute()
    return {"message": "Admin registered successfully", "id": res.data[0]["id"]}

@router.put("/profile/update", response_model=dict)
async def update_profile(data: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {}
    if data.full_name:
        update_data["full_name"] = data.full_name
    if data.email:
        # Check if new email is already taken
        if data.email != current_user["email"]:
            existing = supabase.table("users").select("id").eq("email", data.email).execute()
            if existing.data:
                raise HTTPException(status_code=400, detail="Email already taken")
            update_data["email"] = data.email
    if data.password:
        update_data["password"] = get_password_hash(data.password)
        
    if not update_data:
        return {"message": "No changes made"}
        
    res = supabase.table("users").update(update_data).eq("email", current_user["email"]).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Database update failed. Please ensure RLS policies allow updating your profile.")
        
    # If email changed, token might need refresh, but for now just return success
    return {"message": "Profile updated successfully", "user": res.data[0]}
