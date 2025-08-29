FROM openjdk:17-jdk-slim

WORKDIR /app

# Копирај Maven wrapper и pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Преземи dependencies
RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B

# Копирај го изворниот код
COPY src src

# Build-ај ја апликацијата
RUN ./mvnw clean package -DskipTests

# Копирај ја built JAR датотеката
RUN cp target/*.jar app.jar

# Експонирај го портот
EXPOSE 8080

# Создај директориум за uploads
RUN mkdir -p /app/uploads

# Стартај ја апликацијата
ENTRYPOINT ["java", "-jar", "/app/app.jar"]