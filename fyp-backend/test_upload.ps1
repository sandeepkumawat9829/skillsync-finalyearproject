$ErrorActionPreference = "Stop"

# Use unique email to ensure registration works
$email = "uploader" + (Get-Random) + "@test.com"
Write-Host "Registering user: $email"

# 1. Register
try {
    $registerBody = @{
        email = $email
        password = "password"
        fullName = "Upload Tester"
        role = "STUDENT"
        enrollmentNumber = "ENR" + (Get-Random)
        branch = "Computer Science"
        currentSemester = 5
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -ContentType "application/json" -Body $registerBody
    Write-Host "Registration successful."
} catch {
    Write-Host "Registration failed: $_"
    # Proceeding might fail if user wasn't created, but we'll try login anyway
}

# 2. Login
Write-Host "Logging in..."
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = $email
        password = "password"
    } | ConvertTo-Json)

    $token = $loginResponse.token
    Write-Host "Got Token: $token"
} catch {
    Write-Host "Login failed: $_"
    exit 1
}

# 3. Create Project
Write-Host "Creating Project..."
try {
    $headers = @{ Authorization = "Bearer $token" }
    $project = Invoke-RestMethod -Uri "http://localhost:8080/api/projects" -Method Post -ContentType "application/json" -Headers $headers -Body (@{
        title = "Cloudinary Test Project " + (Get-Random)
        abstractText = "This is a test abstract for the Cloudinary integration test project."
        fullDescription = "Testing file uploads and Cloudinary integration."
        domain = "Information Technology"
        visibility = "PUBLIC"
    } | ConvertTo-Json)

    $projectId = $project.id
    Write-Host "Created Project ID: $projectId"
} catch {
    Write-Host "Project creation failed: $_"
    exit 1
}

# 4. Create Dummy File
"This is a test file for Cloudinary upload." | Out-File -FilePath "test_upload_file.pdf" -Encoding utf8

# 5. Upload Document
Write-Host "Uploading Document..."
$uploadUrl = "http://localhost:8080/api/documents/project/$projectId/upload"
$authHeader = "Authorization: Bearer $token"

# using cmd /c curl
$curlCmd = "curl -X POST ""$uploadUrl"" -H ""$authHeader"" -F ""file=@test_upload_file.pdf"" -F ""documentType=PROPOSAL"" -F ""description=Test Description"""
cmd /c $curlCmd

Write-Host "`nUpload Test Complete!"
