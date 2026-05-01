# Infraestructura — Proyecto de Grado MaIA

![Terraform](https://img.shields.io/badge/Terraform-%3E%3D1.5.0-844FBA?logo=terraform&logoColor=white)

Este directorio contiene la configuración de Terraform para la infraestructura AWS del proyecto de grado de la Maestría en Inteligencia Artificial (MaIA) de la Universidad de los Andes.

---

## Qué crea este Terraform

| Recurso | Nombre | Descripción |
|---|---|---|
| IAM User | `maia-proyecto-user` | Usuario con permiso exclusivo de asumir el role |
| IAM Role | `maia-proyecto-grado` | Role con permisos de lectura/escritura en S3 |
| S3 Bucket (datos) | `maia-proyecto-final` | Bucket principal del proyecto (dataset `MaIA_Scoliosis_Dataset`) |

El estado de Terraform se guarda en S3:
- **Bucket de estado:** `maia-terraform-state-673857242697`
- **Key:** `maia-proyecto-final/terraform.tfstate`

---

## Prerrequisitos

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5.0
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) instalado y configurado
- Credenciales del usuario `maia-proyecto-user` (pedirlas al líder del proyecto)

---

## Configuración inicial para colaboradores

### 1. Obtener las credenciales

Solicita al líder del proyecto el `Access Key ID` y el `Secret Access Key` del usuario `maia-proyecto-user`. **No compartas estas credenciales por canales inseguros.**

### 2. Configurar el perfil AWS

Crea un perfil dedicado para el proyecto en tu configuración de AWS CLI:

```bash
aws configure --profile maia-proyecto
```

Ingresa los valores cuando se soliciten:

```
AWS Access Key ID:     <access_key_id que te entregaron>
AWS Secret Access Key: <secret_access_key que te entregaron>
Default region name:   us-east-1
Default output format: json
```

### 3. Configurar el assume role

Edita el archivo `~/.aws/config` y agrega la siguiente sección al final:

```ini
[profile maia-rol]
role_arn       = arn:aws:iam::673857242697:role/maia/maia-proyecto-grado
source_profile = maia-proyecto
region         = us-east-1
```

Con esto, el perfil `maia-rol` asumirá automáticamente el role `maia-proyecto-grado` usando las credenciales del perfil `maia-proyecto`.

### 4. Verificar que funciona

```bash
aws sts get-caller-identity --profile maia-rol
```

La respuesta debe mostrar el ARN del role, no del usuario:

```json
{
    "UserId": "AROA...:botocore-session-...",
    "Account": "673857242697",
    "Arn": "arn:aws:iam::673857242697:assumed-role/maia-proyecto-grado/botocore-session-..."
}
```

---

## Trabajar con Terraform

Siempre usa el perfil `maia-rol` para que Terraform opere con los permisos del role.

### Inicializar el backend

```bash
cd terraform/
AWS_PROFILE=maia-rol terraform init
```

### Ver los cambios antes de aplicar

```bash
AWS_PROFILE=maia-rol terraform plan
```

### Aplicar cambios

Solo el líder del proyecto debe aplicar cambios a producción:

```bash
AWS_PROFILE=maia-rol terraform apply
```

### Ver outputs (ARNs, IDs)

```bash
AWS_PROFILE=maia-rol terraform output
```

Para ver la secret key del usuario (solo al crearlo por primera vez):

```bash
AWS_PROFILE=maia-rol terraform output -raw iam_user_secret_access_key
```

---

## Estructura de archivos

```
terraform/
├── main.tf        # Provider AWS y configuración del backend S3
├── variables.tf   # Variables: región, account ID, nombres de recursos
├── iam.tf         # Usuario IAM, role y políticas
├── outputs.tf     # Outputs: ARNs, access key ID
└── README.md      # Este archivo
```

---

## Subir el dataset

```bash
aws s3 sync \
  ruta/local/MaIA_Scoliosis_Dataset \
  s3://maia-proyecto-final/MaIA_Scoliosis_Dataset \
  --exclude "*.DS_Store" \
  --profile maia-rol
```

---

## Notas importantes

- **No compartas el `terraform.tfstate` por correo o chat.** El estado se almacena en S3 y se accede automáticamente al hacer `terraform init`.
- **No hagas `terraform apply` sin coordinarlo con el equipo.** Los cambios de infraestructura afectan a todos.
- El usuario `maia-proyecto-user` no puede hacer nada directamente en AWS — solo puede asumir el role. Todos los permisos reales están en el role `maia-proyecto-grado`.
