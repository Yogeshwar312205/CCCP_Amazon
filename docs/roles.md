
Document Information
Item	Details
Project Title	Cloud-Based E-Commerce Application with Automated CI/CD and DevSecOps on AWS
Project Domain	Cloud Computing / DevOps / DevSecOps
Primary Cloud Platform	Amazon Web Services (AWS)
Application Architecture	Containerized Web Application
Frontend	React.js
Backend	Node.js + Express.js
Database	MySQL on Amazon RDS
Container Platform	Amazon ECS with AWS Fargate
CI/CD	AWS CodePipeline + AWS CodeBuild
Container Registry	Amazon ECR
Security	DevSecOps + IAM + Secrets Manager + WAF
Monitoring	Amazon CloudWatch

1. Project Overview
The proposed project is a cloud-native e-commerce application deployed on Amazon Web Services (AWS) with an automated CI/CD pipeline and DevSecOps practices integrated throughout the software delivery lifecycle.
The project combines software development, cloud infrastructure, containerization, continuous integration, continuous deployment, security automation, monitoring, and scalable application deployment.
The primary objective is to demonstrate how a conventional web application can be transformed into a secure, automated, containerized and cloud-deployed application using modern AWS services and DevOps practices.
Developers will push source code to a centralized Git repository. The change will automatically trigger the CI/CD pipeline, where the application is built, tested, security-checked, containerized, and deployed to AWS.
The deployment architecture uses Amazon ECS with AWS Fargate rather than manually managing application servers. Persistent data is stored using Amazon RDS for MySQL, while AWS networking, IAM, Secrets Manager, CloudWatch and WAF provide infrastructure, security and monitoring capabilities.
2. Project Objectives
1.	Develop a functional cloud-based e-commerce application.
2.	Containerize the application using Docker.
3.	Deploy the application using Amazon ECS and AWS Fargate.
4.	Implement an automated CI/CD pipeline using AWS services.
5.	Integrate DevSecOps security checks into the CI/CD pipeline.
6.	Use Amazon ECR for container image management.
7.	Use Amazon RDS for MySQL for persistent database storage.
8.	Implement secure networking using Amazon VPC.
9.	Implement IAM-based access control.
10.	Secure sensitive credentials using AWS Secrets Manager.
11.	Monitor application and infrastructure health using Amazon CloudWatch.
12.	Protect the public application using AWS WAF.
13.	Demonstrate automated deployment whenever new code is pushed.
14.	Demonstrate failure handling where unsuccessful builds or security checks prevent deployment.
15.	Demonstrate cloud-native architecture and container orchestration concepts.
3. Proposed System
The proposed system consists of two major layers.
3.1 Application Layer
•	React-based frontend
•	Node.js and Express backend
•	MySQL database
•	REST APIs
•	Authentication and authorization
•	Product management
•	Shopping cart
•	Order management
3.2 Cloud and DevOps Layer
•	GitHub
•	AWS CodePipeline
•	AWS CodeBuild
•	Amazon ECR
•	Amazon ECS
•	AWS Fargate
•	Application Load Balancer
•	Amazon RDS
•	Amazon VPC
•	AWS IAM
•	AWS Secrets Manager
•	Amazon CloudWatch
•	AWS WAF
DevSecOps tools will additionally be integrated for source-code, dependency, secret and container security analysis.

4. High-Level Architecture
 


5. Technology Stack
5.1 Frontend
React.js will provide the user-facing application.
•	User interface
•	Product browsing
•	Authentication interface
•	Shopping cart
•	Checkout
•	Order history
•	Admin interface
•	REST API integration
5.2 Backend
Node.js with Express.js will provide the REST API and application business logic.
•	REST API development
•	Authentication
•	User management
•	Product management
•	Cart management
•	Order processing
•	Database communication
•	Business logic
5.3 Database
MySQL will be used as the relational database, hosted in production using Amazon RDS for MySQL.
•	Users
•	Products
•	Categories
•	Cart
•	Cart Items
•	Orders
•	Order Items
•	Payments
5.4 Containerization
Docker will be used to package application components into portable and reproducible containers.
React / Node.js Application
          │
       Docker Build
          │
      Docker Image
          │
       Amazon ECR
          │
    ECS / Fargate
6. AWS Services
6.1 Amazon VPC
Provides an isolated networking environment using public/private subnets, route tables, an Internet Gateway and Security Groups. The database will remain in a private network segment.
6.2 Amazon ECS
Provides container orchestration through task definitions, services, desired task counts, health management and application deployments.
6.3 AWS Fargate
Provides managed compute for ECS containers without requiring the team to provision or maintain EC2 instances.
6.4 Amazon ECR
Stores Docker images and acts as the centralized container image repository used by ECS deployments.
6.5 AWS CodePipeline
Orchestrates the CI/CD workflow from source control through build, security validation and deployment.
6.6 AWS CodeBuild
Performs dependency installation, builds, tests, security checks, Docker image creation and image publishing.
6.7 Amazon RDS
Provides managed MySQL database infrastructure with operational capabilities such as backups, monitoring and security controls.
6.8 Application Load Balancer
Provides HTTP/HTTPS traffic routing, health checks and distribution of traffic across ECS tasks.
6.9 AWS IAM
Controls permissions between users and AWS services using roles and policies while following least-privilege access.
6.10 AWS Secrets Manager
Securely stores database credentials, JWT secrets, API credentials and other sensitive configuration values.
6.11 Amazon CloudWatch
Provides centralized application logs, infrastructure metrics, monitoring and alarms.
6.12 AWS WAF
Provides a web application security layer in front of the public application and can filter unwanted or malicious web traffic.
7. CI/CD Pipeline
The CI/CD pipeline is the central feature of the project. A source-code change will automatically trigger build, testing, security validation, image creation and deployment.
 

8. DevSecOps Integration
Security will be integrated into the software delivery lifecycle instead of being treated only as a final-stage activity.
8.1 Static Application Security Testing
SonarQube or Semgrep can be integrated to identify security vulnerabilities, unsafe coding patterns and code-quality issues.
8.2 Dependency Security
npm audit will be used to identify known vulnerabilities in third-party Node.js packages.
8.3 Secret Detection
Gitleaks can scan the repository for accidentally committed passwords, API keys, tokens and cloud credentials.
8.4 Container Security
Trivy and/or Amazon ECR image scanning can be used to identify vulnerabilities in Docker images before deployment.
Security principle:  A failed critical security or quality gate should prevent the affected build from being promoted to deployment.

9. Security Architecture
                      

10. Application Modules
Module	Key Functions
User Module	Registration, login, authentication and profile management.
Product Module	Product listing, product details, search, categories and stock information.
Cart Module	Add product, remove product, update quantity and cart total.
Order Module	Create order, order history, order status and order details.
Admin Module	Add, update and delete products, manage inventory and view orders.
Authentication Module	JWT-based authentication, password hashing and role-based authorization.

11. Team Structure
                    PROJECT TEAM
                         │
                         ▼
              ┌──────────────────────┐
              │   Yogeshwar Shinde   │
              │   Team Lead + DevOps │
              └───────────┬──────────┘
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │  Tanmay  │ │  Soham   │ │    Rushil    │
        │ Developer│ │ DevOps   │ │ Developer +  │
        │          │ │ Engineer │ │ Scrum Coord. │
        └──────────┘ └──────────┘ └──────────────┘
12. Individual Roles and Responsibilities
12.1 Yogeshwar Shinde — Team Lead + DevOps
Yogeshwar will be responsible for overall technical direction, project leadership, DevOps implementation, AWS infrastructure and integration of the application with the cloud environment.
Project Leadership
•	Overall project coordination
•	Technical decision-making
•	Architecture design
•	Integration of application and cloud components
•	Code review and technical validation
•	Final system integration
•	Coordination between development and DevOps activities
AWS and Cloud Infrastructure
•	AWS infrastructure architecture
•	VPC architecture and networking
•	Subnets and Security Groups
•	IAM
•	ECS and Fargate
•	ECR
•	RDS
•	Application Load Balancer
•	Secrets Manager
•	CloudWatch
•	WAF
DevOps
•	CI/CD architecture
•	CodePipeline
•	CodeBuild
•	Docker deployment strategy
•	ECR integration
•	ECS deployment
•	Environment configuration
•	Automated deployment
•	Deployment troubleshooting
DevSecOps
•	Security gate design
•	Integration of vulnerability scanning
•	IAM security
•	Secrets management
•	Container security
•	Deployment security
•	Security validation within CI/CD
Technical Leadership
•	Resolve integration issues
•	Review pull requests
•	Maintain architecture documentation
•	Coordinate DevOps and development teams
•	Lead final cloud deployment
•	Lead the technical demonstration
12.2 Tanmay — Application Developer
Tanmay will primarily focus on application development and application-level testing.
Frontend
•	React application
•	UI components
•	Product pages
•	Cart interface
•	Checkout interface
•	User interface integration
Backend
•	REST APIs
•	Product APIs
•	User APIs
•	Cart APIs
•	Order APIs
Database Integration
•	MySQL schema implementation
•	Queries
•	Database relationships
•	Backend-database integration
Testing and Collaboration
•	API testing
•	Unit testing
•	Functional testing
•	Bug fixing
•	Git branching and pull requests
•	Coordination with the DevOps team for deployment requirements
12.3 Soham — DevOps Engineer
Soham will support DevOps implementation, containerization, CI/CD and cloud deployment activities.
Containerization
•	Dockerfiles
•	Docker image optimization
•	Local container testing
•	Docker Compose where required
CI/CD
•	CodePipeline configuration support
•	CodeBuild configuration
•	Build specifications
•	Deployment automation
•	Pipeline testing
Container Registry
•	ECR repositories
•	Image tagging
•	Image lifecycle management
•	Image deployment workflow
ECS/Fargate
•	ECS task configuration
•	ECS service configuration
•	Container environment configuration
•	Health checks
•	Deployment troubleshooting
Monitoring
•	CloudWatch logs
•	CloudWatch metrics
•	Application monitoring
•	Deployment monitoring
Soham will work closely with Yogeshwar on AWS infrastructure and DevOps implementation.
12.4 Rushil — Application Developer + Scrum Coordinator
Rushil will combine application development responsibilities with project coordination and Scrum activities.
Development Responsibilities
•	Backend/frontend development
•	API integration
•	Authentication implementation
•	Application testing
•	Bug fixing
•	Feature integration
Scrum Responsibilities
•	Coordinate team activities
•	Maintain task distribution
•	Conduct team meetings
•	Track development progress
•	Maintain task board
•	Coordinate between developers and DevOps
•	Identify blockers
•	Maintain project documentation
•	Ensure agreed requirements are implemented
Rushil will also help coordinate communication between the application development and DevOps teams.
13. Git and Branching Strategy
GitHub will be used for centralized source-code management and collaboration.
main
 │
 ├── develop
 │
 ├── feature/frontend
 │
 ├── feature/backend
 │
 ├── feature/authentication
 │
 └── feature/devops
Developer
   ↓
Feature Branch
   ↓
Commit
   ↓
Pull Request
   ↓
Code Review
   ↓
Merge
   ↓
CI/CD Pipeline
The main branch will contain stable code intended for deployment.
14. CI/CD Quality Gates
Source
  ↓
Build
  ↓
Unit Tests
  ↓
Code Quality
  ↓
Dependency Security
  ↓
Secret Detection
  ↓
Docker Build
  ↓
Container Security
  ↓
Deployment
Quality principle:  A failed security or quality gate should prevent the affected build from proceeding to deployment.

15. Scalability
The architecture supports horizontal scaling through ECS/Fargate.
                 Application Load Balancer
                          │
              ┌───────────┼───────────┐
              │           │           │
           ECS Task    ECS Task    ECS Task
              │           │           │
              └───────────┼───────────┘
                          │
                        RDS
Additional ECS tasks can be launched as application demand increases, while the load balancer distributes traffic across healthy tasks.
16. Availability and Reliability
•	ECS services
•	AWS Fargate
•	Application Load Balancer
•	Amazon RDS
•	Health checks
•	CloudWatch monitoring
•	Automated deployments
The Application Load Balancer can stop routing traffic to unhealthy application tasks.
17. Monitoring and Observability
Application Metrics
•	HTTP requests
•	Response errors
•	Response time
•	Application logs
Infrastructure Metrics
•	CPU usage
•	Memory usage
•	ECS task status
•	RDS metrics
•	ALB metrics
Alerts
High CPU
   ↓
CloudWatch Alarm

Application Error
   ↓
CloudWatch Logs

Unhealthy ECS Task
   ↓
ALB Health Check
18. Expected Project Outcomes
16.	A functional e-commerce application.
17.	Containerized frontend and backend services.
18.	Cloud-hosted MySQL database.
19.	AWS VPC-based network architecture.
20.	Automated CI/CD pipeline.
21.	Docker image management using Amazon ECR.
22.	Container deployment using ECS/Fargate.
23.	Load balancing using an Application Load Balancer.
24.	Automated application testing.
25.	DevSecOps security validation.
26.	Secure secret management.
27.	Application monitoring using CloudWatch.
28.	Web application protection using AWS WAF.
29.	Automated deployment after successful code changes.
30.	Pipeline failure when quality or security requirements are not satisfied.
19. Key Learning Outcomes
Cloud Computing
•	Cloud infrastructure
•	VPC networking
•	Managed databases
•	Container orchestration
•	Serverless container compute
•	Load balancing
•	Scalability
DevOps
•	Git workflows
•	CI/CD
•	Docker
•	Container registries
•	Automated deployment
•	Infrastructure management
•	Monitoring
DevSecOps
•	Secure coding
•	SAST
•	Dependency scanning
•	Secret detection
•	Container vulnerability scanning
•	IAM
•	Secrets management
•	Web application security
Software Engineering
•	Agile/Scrum
•	Git-based collaboration
•	Code reviews
•	Modular development
•	Testing
•	Documentation
•	Team-based development
20. Final Technology Summary
Category	Technology / Services
Application	React.js, Node.js, Express.js, MySQL, REST API, JWT Authentication
Development	Git, GitHub, Docker, VS Code, Postman
AWS	Amazon VPC, AWS IAM, AWS CodePipeline, AWS CodeBuild, Amazon ECR, Amazon ECS, AWS Fargate, Application Load Balancer, Amazon RDS MySQL, AWS Secrets Manager, Amazon CloudWatch, AWS WAF
DevSecOps	SonarQube / Semgrep, npm audit, Gitleaks, Trivy, ECR Image Scanning

21. Project Definition
Formal Project Definition:  A cloud-native e-commerce platform implementing automated CI/CD and DevSecOps practices on AWS. The system uses containerized React and Node.js services deployed through Amazon ECS with AWS Fargate, persistent data storage through Amazon RDS MySQL, automated build and deployment through AWS CodePipeline and CodeBuild, container management through Amazon ECR, secure networking through Amazon VPC, access control through IAM, secret management through AWS Secrets Manager, monitoring through Amazon CloudWatch, and web application protection through AWS WAF.

22. Core Project Architecture
                         GITHUB
                            │
                            ▼
                    AWS CODEPIPELINE
                            │
                            ▼
                     AWS CODEBUILD
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          Testing        Security       Docker
             │              │              │
             └──────────────┼──────────────┘
                            │
                            ▼
                    SECURITY GATE
                            │
                            ▼
                       AMAZON ECR
                            │
                            ▼
                      AMAZON ECS
                            │
                         FARGATE
                            │
                            ▼
                          ALB
                            │
                            ▼
                         USERS
                            │
                            ▼
                     NODE.JS API
                            │
                            ▼
                     AMAZON RDS
                         MYSQL

       ┌────────────────────────────────────────┐
       │           AWS SUPPORT SERVICES          │
       │ VPC │ IAM │ Secrets Manager │ CloudWatch│
       │ WAF                                      │
       └────────────────────────────────────────┘
23. Project Philosophy
Develop → Integrate → Test → Secure → Containerize → Deploy → Monitor
Rather than treating cloud deployment as a one-time activity, the project demonstrates a complete software delivery lifecycle in which application development, cloud infrastructure, automation, security and monitoring operate as an integrated system.
