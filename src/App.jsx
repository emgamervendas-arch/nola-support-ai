import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900/80 backdrop-blur">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Nola Support AI
            </h1>

            <p className="text-zinc-400 text-sm mt-1">
              Assistente inteligente integrado ao n8n + Groq
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-emerald-400 text-sm font-medium">Online</span>
          </div>
        </header>

        <ChatArea />
      </div>
    </div>
  );
}

function ChatArea() {
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);

  const [mensagens, setMensagens] = useState([
    {
      tipo: 'bot',
      texto: 'Olá! Sou o assistente da Nola. Como posso ajudar você hoje?',
    },
  ]);

  const mensagensEndRef = useRef(null);

  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [mensagens, loading]);

  async function enviarMensagem() {
    if (!mensagem.trim() || loading) return;

    const textoUsuario = mensagem;

    setMensagens((prev) => [
      ...prev,
      {
        tipo: 'user',
        texto: textoUsuario,
      },
    ]);

    setMensagem('');
    setLoading(true);

    try {
      const resposta = await fetch(
        'https://trpdemiranda.app.n8n.cloud/webhook-test/nola-support',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pergunta: textoUsuario,
          }),
        }
      );

      if (!resposta.ok) {
        throw new Error('Erro na API');
      }

      const dados = await resposta.json();

      setMensagens((prev) => [
        ...prev,
        {
          tipo: 'bot',
          texto:
            dados.resposta || 'Não consegui gerar uma resposta no momento.',
        },
      ]);
    } catch (error) {
      setMensagens((prev) => [
        ...prev,
        {
          tipo: 'bot',
          texto: 'Erro ao conectar com o servidor. Verifique o webhook do n8n.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  }

  return (
    <>
      {/* CHAT */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950">
        {mensagens.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
              msg.tipo === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.tipo === 'bot' && (
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <Bot size={18} />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-lg whitespace-pre-wrap ${
                msg.tipo === 'user'
                  ? 'bg-emerald-500 text-black rounded-br-md'
                  : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
              }`}
            >
              {msg.texto}
            </div>

            {msg.tipo === 'user' && (
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <Bot size={18} />
            </div>

            <div className="bg-zinc-800 border border-zinc-700 px-5 py-4 rounded-3xl rounded-bl-md flex gap-1">
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-150" />
              <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-300" />
            </div>
          </div>
        )}

        <div ref={mensagensEndRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-zinc-800 p-4 bg-zinc-900">
        <div className="flex items-end gap-3">
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Digite sua pergunta..."
            className="flex-1 resize-none bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder:text-zinc-500"
          />

          <button
            onClick={enviarMensagem}
            disabled={loading || !mensagem.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all p-4 rounded-2xl text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}