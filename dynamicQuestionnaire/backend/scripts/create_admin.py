from app.repositories.user_repository import UserRepository
from app.core.securtiy import hash_password

admin_user={
    "name":"Admin",
    "email":"admin@company.com",
    "passwordHash":hash_password("Admin@123"),
    "role":"ADMIN",
    "isActive": True
}

UserRepository.create_user(admin_user)
print("Admin user created successfully")