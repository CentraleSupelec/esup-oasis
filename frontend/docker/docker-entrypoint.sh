#!/bin/sh

# Générer un fichier env.{timestamp}.js avec toutes les variables REACT_APP_*
TIMESTAMP=$(date +%s)
ENV_FILE="/usr/share/caddy/env.${TIMESTAMP}.js"
DOTENV_FILE="/tmp/.env"

# Construire la liste des clés déjà présentes dans l'environnement (séparées par ':')
env_keys=$(env | grep '^REACT_APP_' | cut -d= -f1 | tr '\n' ':')

{
  printf 'window.env = {\n'

  # Variables du fichier .env absentes de l'environnement (l'env est prioritaire)
  if [ -f "$DOTENV_FILE" ]; then
    grep '^REACT_APP_' "$DOTENV_FILE" | grep -v '^#' | while IFS='=' read -r key value; do
      case ":${env_keys}:" in
        *":${key}:"*) ;;
        *)
          # Supprimer les guillemets entourant la valeur (simples ou doubles)
          value=$(printf '%s' "$value" | sed "s/^['\"]//; s/['\"]$//")
          escaped=$(printf '%s' "$value" | sed 's/\\/\\\\/g; s/"/\\"/g')
          printf '  "%s": "%s",\n' "$key" "$escaped"
          ;;
      esac
    done
  fi

  # Variables d'environnement (prioritaires)
  env | grep '^REACT_APP_' | while IFS='=' read -r key value; do
    escaped=$(printf '%s' "$value" | sed 's/\\/\\\\/g; s/"/\\"/g')
    printf '  "%s": "%s",\n' "$key" "$escaped"
  done

  printf '};\n'
} > "$ENV_FILE"

# Mettre à jour index.html pour référencer le fichier timestampé
sed -i "s|/env\.js|/env.${TIMESTAMP}.js|g" /usr/share/caddy/index.html

# Exécuter Caddy (substitue nativement {$REACT_APP_*} dans le Caddyfile)
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile