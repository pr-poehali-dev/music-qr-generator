import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface Song {
  id: string;
  title: string;
  artist: string;
  story: string;
  createdAt: Date;
}

const Index = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    story: ''
  });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.artist || !formData.story) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    const newSong: Song = {
      id: Date.now().toString(),
      title: formData.title,
      artist: formData.artist,
      story: formData.story,
      createdAt: new Date()
    };

    setSongs([newSong, ...songs]);
    setFormData({ title: '', artist: '', story: '' });
    toast.success('Песня успешно добавлена!');
  };

  const downloadQR = (song: Song) => {
    const canvas = document.getElementById(`qr-${song.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    
    const svg = canvas.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${song.title}-qr.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('QR-код скачан!');
  };

  const getSongUrl = (songId: string) => {
    return `${window.location.origin}/song/${songId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            QR Музыка
          </h1>
          <p className="text-muted-foreground text-lg">
            Сохраните историю каждой песни с уникальным QR-кодом
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="animate-scale-in shadow-xl border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Plus" size={24} className="text-primary" />
                Добавить песню
              </CardTitle>
              <CardDescription>
                Заполните информацию о песне и её истории
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Название песни</Label>
                  <Input
                    id="title"
                    placeholder="Например, Bohemian Rhapsody"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="transition-all focus:scale-[1.01]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artist">Исполнитель</Label>
                  <Input
                    id="artist"
                    placeholder="Например, Queen"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    className="transition-all focus:scale-[1.01]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story">История песни</Label>
                  <Textarea
                    id="story"
                    placeholder="Расскажите, что эта песня значит для вас..."
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    rows={6}
                    className="resize-none transition-all focus:scale-[1.01]"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Icon name="Music" size={20} className="mr-2" />
                  Создать QR-код
                </Button>
              </form>
            </CardContent>
          </Card>

          {selectedSong && (
            <Card className="animate-scale-in shadow-xl border-primary/20 bg-gradient-to-br from-card to-secondary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="QrCode" size={24} className="text-primary" />
                  QR-код песни
                </CardTitle>
                <CardDescription>
                  Отсканируйте код для доступа к истории
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-lg" id={`qr-${selectedSong.id}`}>
                  <QRCodeSVG
                    value={getSongUrl(selectedSong.id)}
                    size={240}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-semibold text-xl">{selectedSong.title}</h3>
                  <p className="text-muted-foreground">{selectedSong.artist}</p>
                </div>
                <Button onClick={() => downloadQR(selectedSong)} variant="outline" size="lg" className="w-full">
                  <Icon name="Download" size={20} className="mr-2" />
                  Скачать QR-код
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Icon name="Library" size={28} className="text-primary" />
            Ваша коллекция
          </h2>

          {songs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Icon name="Music" size={64} className="text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg">
                  Пока здесь пусто. Добавьте первую песню!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs.map((song, index) => (
                <Card
                  key={song.id}
                  className="cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 animate-fade-in border-primary/10"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedSong(song)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{song.title}</CardTitle>
                        <CardDescription className="truncate">{song.artist}</CardDescription>
                      </div>
                      <Icon 
                        name={selectedSong?.id === song.id ? "Check" : "QrCode"} 
                        size={20} 
                        className={selectedSong?.id === song.id ? "text-primary" : "text-muted-foreground"} 
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{song.story}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
