from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def normalizar_documento(valor: str) -> str:
    return ''.join(c for c in valor if c.isdigit())

class CadastroRequest(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    documento: str = Field(description="CPF ou CNPJ, com ou sem pontuação")
    email: EmailStr
    senha: str = Field(min_length=8, max_length=128)

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, v: str) -> str:
        v = ' '.join(v.split())
        if len(v) < 2:
            raise ValueError("Informe o nome completo.")
        return v

    @field_validator("documento")
    @classmethod
    def validar_documento(cls, v: str) -> str:
        d = normalizar_documento(v)
        if len(d) not in (11, 14) or len(set(d)) == 1:
            raise ValueError("Informe um CPF ou CNPJ válido.")
        return d

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, v):
        return str(v).strip().lower()

class LoginRequest(BaseModel):
    identificador: str = Field(min_length=1, max_length=254, description="E-mail ou CPF/CNPJ")
    senha: str = Field(min_length=1, max_length=128)

class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    email: EmailStr

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    usuario: UsuarioResponse

class RecuperacaoRequest(BaseModel):
    email: EmailStr

class RedefinirSenhaRequest(BaseModel):
    token: str = Field(min_length=32, max_length=256)
    nova_senha: str = Field(min_length=8, max_length=128)


class GoogleLoginRequest(BaseModel):
    credential: str = Field(min_length=20, max_length=8192, description="ID token retornado pelo Google Identity Services")


class AtualizarUsuarioRequest(BaseModel):
    """Campos editáveis do perfil; envie um ou mais campos para atualizar."""
    nome: str | None = Field(default=None, min_length=2, max_length=120)
    documento: str | None = Field(default=None, description="CPF ou CNPJ, com ou sem pontuação")
    email: EmailStr | None = None

    @field_validator("nome")
    @classmethod
    def validar_nome_atualizacao(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = ' '.join(v.split())
        if len(v) < 2:
            raise ValueError("Informe um nome com pelo menos 2 caracteres.")
        return v

    @field_validator("documento")
    @classmethod
    def validar_documento_atualizacao(cls, v: str | None) -> str | None:
        if v is None:
            return v
        d = normalizar_documento(v)
        if len(d) not in (11, 14) or len(set(d)) == 1:
            raise ValueError("Informe um CPF ou CNPJ válido.")
        return d

    @field_validator("email")
    @classmethod
    def normalizar_email_atualizacao(cls, v):
        return str(v).strip().lower() if v is not None else v
