import { useEffect, useState } from "react";
import useSWR from "swr";

async function fetchApi(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <StatusContent />
    </>
  );
}

function StatusContent() {
  const [dbInfo, setDbInfo] = useState({
    openedConnections: null,
    maxConnections: null,
    version: undefined,
  });
  const [updatedAtText, setUpdatedAtText] = useState("");
  const { isLoading, data } = useSWR("/api/v1/status", fetchApi, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    if (!isLoading && data) {
      console.log(data);
      setDbInfo({
        version: data.dependecies.database.version,
        maxConnections: data.dependecies.database.max_connections,
        openedConnections: data.dependecies.database.opened_connections,
      });
      setUpdatedAtText(new Date(data.updated_at).toLocaleString("pt-BR"));
    }
  }, [isLoading, data]);

  if (isLoading) {
    return <div>Carregando informações...</div>;
  }

  return (
    <div>
      <p>
        <strong>Máximo de Conexões:</strong> {dbInfo.maxConnections}
      </p>
      <p>
        <strong>Conexões abertas:</strong> {dbInfo.openedConnections}
      </p>
      <p>
        <strong>Versão:</strong> {dbInfo.version}
      </p>
      <span>Última atualização: {updatedAtText}</span>
    </div>
  );
}
