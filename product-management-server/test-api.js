// Test script to verify API connection
const testApiConnection = async () => {
    const apiUrl = 'https://product-management-server-zeta.vercel.app';
    const testUserId = 'test-user-' + Math.random().toString(36).substr(2, 9);
    
    console.log('Testing API connection...');
    console.log('API URL:', apiUrl);
    console.log('Test User ID:', testUserId);
    
    try {
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await fetch(`${apiUrl}/health`);
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);
        
        // Test products endpoint with X-User-Id
        console.log('\n2. Testing products endpoint...');
        const productsResponse = await fetch(`${apiUrl}/api/products`, {
            headers: {
                'X-User-Id': testUserId,
                'Content-Type': 'application/json'
            }
        });
        
        if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            console.log('Products API success:', productsData);
        } else {
            const errorText = await productsResponse.text();
            console.log('Products API error:', productsResponse.status, errorText);
        }
        
    } catch (error) {
        console.error('API test failed:', error.message);
    }
};

// Run the test
testApiConnection();
