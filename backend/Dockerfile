FROM python:3.10-slim

WORKDIR /app

COPY . .

RUN pip install --upgrade pip setuptools wheel \
 && pip install -r requirements.txt

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"] 