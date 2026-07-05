"""
Auth endpoints: login, refresh, me, logout.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .responses import success_response


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return success_response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'phone': user.phone,
            'employee_id': user.employee_id,
            'department': user.department,
            'roles': list(user.roles.values_list('code', flat=True)),
            'is_superuser': user.is_superuser,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return success_response(message='已登出')


urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
