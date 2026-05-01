# API

![Python](https://img.shields.io/badge/python-%3E%3D3.10-blue?logo=python&logoColor=white)

API REST construida con FastAPI para exponer el modelo de avalúo de propiedades.

## Requisitos previos

- Python >= 3.10
- `tox` versión 4+

## Configuración del ambiente virtual

```bash
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install tox
```

## Instalación del modelo (.whl)

El modelo se instala como una dependencia desde el archivo `.whl` ubicado en `model-pkg/`. Se instala automáticamente al ejecutar tox, pero si deseas instalarlo manualmente:

```bash
pip install model-pkg/model_avaluo-0.1.0-py3-none-any.whl
```

También puedes instalar todas las dependencias de la aplicación:

```bash
pip install -r requirements.txt
```

## Ejecutar pruebas

Para correr el conjunto de pruebas con salida detallada:

```bash
tox -e test_app -- -s
```

## Levantar la aplicación

Para iniciar el servidor de la aplicación:

```bash
tox run -e run
```

La aplicación quedará disponible en `http://localhost:8001`.

---

## Cómo construir la imagen Docker de la API

1. Asegúrate de tener Docker instalado en tu sistema.
2. Ubícate en la carpeta raíz del proyecto donde está el `Dockerfile` de la API.
3. Ejecuta el siguiente comando para construir la imagen (puedes cambiar el nombre `avaluo-api` por el que prefieras):

```bash
docker build -t valuation-api:latest .
```

4. Una vez construida la imagen, puedes correr un contenedor localmente con:

```bash
docker run -p 8001:8001 avaluo-api
```

Esto expondrá la API en `http://localhost:8001`.

## Cómo publicar tu docker en ECR

### Prerequisitos

- Antes de publicar la imagen en ECR debe garantizar que tenga instalado awscli. 
- Debe tener un Reposiorio ECR creado `maia-proyecto-final`
- Debe tener un cluster ECS `maia-proyecto-final-ecs`
- Debe tener un task definition `maia-proyecto-final-task`
- Debe definir un contenedor `maia-proyecto-final-cnt`
- Debe tener el servicio `maia-proyecto-final-service`

#### Validación de awscli

Ejecute el siguiente comando

```bash
aws --version
```

debe salirle algo como lo siguiente

```bash
aws-cli/2.34.4 Python/3.13.11 Darwin/25.3.0 exe/arm64
```

Si no esta instalado siga las [instrucciones](https://docs.aws.amazon.com/es_es/cli/latest/userguide/getting-started-install.html)

#### Configuarar AWS CLI
1. Ejecute el comando de configuracion `aws configure`
2. adicione los datos solicitados
- AWS Access Key ID 
- AWS Secret Access Key 
- AWS Session Token 
- Region (us-east-1)
- format: solo dele enter
3. Verifique que quedo vbien configurado ejecutando el comando `aws iam list-users`, la salida es una lista vacia de usuario


#### Validacion existencia de ECR

Ejecute el siguiente comando para validar que el repositorio existe

```bash
aws ecr describe-repositories --repository-names maia-proyecto-final >/dev/null 2>&1 && echo "Existe" || echo "No existe"
```
Debe salir la palabra `Existe` en consola

### Publicación de la imagen en el ECR

1. Debemos taggear la imagen
```bash
docker tag valuation-api:latest 526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final
```
1. Logearse en aws para poder subir la imagen

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final
```
2. publicar la imagen usando el siguiente comando
```bash
docker push 526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final
```
tambien la puedes hacer buildeando de una vez ejecutando el siguiente comando

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t 526537081285.dkr.ecr.us-east-1.amazonaws.com/maia-proyecto-final:latest \
  --push .
```

### Actualice el servicio 
```bash
aws ecs update-service --cluster maia-proyecto-final-ecs --service maia-proyecto-final-service --force-new-deployment
```
98.89.40.169