export async function logout() {

  const messageDiv = document.getElementById('message');
  
  try {
    // Get the JWT token from localStorage or sessionStorage
    const token = localStorage.getItem('token');

    const response = await fetch('/user/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add the Authorization header
      },
    });

    if (response.status === 200) {
      // Remove the JWT token from the localStorage or sessionStorage
      localStorage.removeItem('token');

      messageDiv.textContent = 'User logged in successfully';

      setTimeout(()=>{
        location.href='/';
      },1000);
      
    } else {
      
      const responseData = await response.json();
      messageDiv.textContent = responseData.message;
    }
  } catch (error) {
    console.error(error);
    alert('An error occurred during logout');
  }
}