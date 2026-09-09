# No Maven build on Render (free tier memory cannot handle it).
# The jar is built + committed locally, Docker just runs it.
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY backend/target/shophub-backend-1.0.0.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=50 -XX:+UseSerialGC"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]