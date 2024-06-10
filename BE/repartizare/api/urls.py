from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import Users, Rooms, Students, Reservations

router = DefaultRouter()
router.register(r'users', Users, basename='users')
router.register(r'rooms', Rooms, basename='rooms')
router.register(r'students', Students, basename='students')
router.register(r'reservations', Reservations, basename='reservations')

urlpatterns = [
    path('', include(router.urls)),
]