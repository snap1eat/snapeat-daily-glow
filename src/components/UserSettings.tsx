import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Info, AlarmClock, Bell, Lock, HelpCircle, MessageSquare, 
  LogOut, FileText, FileCode, Trash2
} from 'lucide-react';

export const UserSettings = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  const { user, updateSettings, logout } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    name: user.profile.name || '',
    email: user.settings?.email || '',
    phone: user.settings?.phone || '',
    password: user.settings?.password || '',
    confirmPassword: '',
    sound: user.settings?.sound ?? true,
    vibration: user.settings?.vibration ?? true,
    animations: user.settings?.animations ?? true,
    motivationalMessages: user.settings?.motivationalMessages ?? true,
    reminderTime: user.settings?.reminderTime || '08:00',
    newsNotifications: user.settings?.newsNotifications ?? true
  });

  useEffect(() => {
    setFormData({
      name: user.profile.name || '',
      email: user.settings?.email || '',
      phone: user.settings?.phone || '',
      password: user.settings?.password || '',
      confirmPassword: '',
      sound: user.settings?.sound ?? true,
      vibration: user.settings?.vibration ?? true,
      animations: user.settings?.animations ?? true,
      motivationalMessages: user.settings?.motivationalMessages ?? true,
      reminderTime: user.settings?.reminderTime || '08:00',
      newsNotifications: user.settings?.newsNotifications ?? true
    });
  }, [user.settings, user.profile]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    await updateSettings({
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      sound: formData.sound,
      vibration: formData.vibration,
      animations: formData.animations,
      motivationalMessages: formData.motivationalMessages,
      reminderTime: formData.reminderTime,
      newsNotifications: formData.newsNotifications,
    });
    
    toast({
      title: "Configuración guardada",
      description: "Los cambios se han guardado correctamente."
    });
    
    onClose();
  };

  const handleDeleteAccount = async () => {
    await logout();
    toast({
      title: "Cuenta eliminada",
      description: "Tu cuenta ha sido eliminada permanentemente."
    });
    onClose();
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    toast({
      description: "Has cerrado sesión correctamente."
    });
    onClose();
    navigate('/');
  };

  const submitFeedback = () => {
    toast({
      title: "Gracias por tu sugerencia",
      description: "Hemos recibido tu comentario y lo revisaremos pronto."
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
        </DialogHeader>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="preferences">
            <AccordionTrigger>Preferencias</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound">Efectos de sonido</Label>
                  <Switch 
                    id="sound"
                    checked={formData.sound}
                    onCheckedChange={(checked) => handleInputChange('sound', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="vibration">Respuesta vibratoria</Label>
                  <Switch 
                    id="vibration"
                    checked={formData.vibration}
                    onCheckedChange={(checked) => handleInputChange('vibration', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="animations">Animaciones</Label>
                  <Switch 
                    id="animations"
                    checked={formData.animations}
                    onCheckedChange={(checked) => handleInputChange('animations', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="motivational">Mensajes de motivación</Label>
                  <Switch 
                    id="motivational"
                    checked={formData.motivationalMessages}
                    onCheckedChange={(checked) => handleInputChange('motivationalMessages', checked)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="profile">
            <AccordionTrigger>Perfil</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
                
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => setConfirmDelete(true)}
                >
                  Eliminar cuenta
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="notifications">
            <AccordionTrigger>Notificaciones</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reminder">Recordatorio (horario)</Label>
                  <Input
                    id="reminder"
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => handleInputChange('reminderTime', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="news">Novedades</Label>
                  <Switch 
                    id="news"
                    checked={formData.newsNotifications}
                    onCheckedChange={(checked) => handleInputChange('newsNotifications', checked)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="privacy">
            <AccordionTrigger>Ajustes de privacidad</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Tu información está protegida y nunca será compartida con terceros sin tu consentimiento.</p>
                <p>Puedes solicitar la eliminación de tus datos en cualquier momento.</p>
                <Button className="mt-2" variant="outline" size="sm">Gestionar preferencias</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="help">
            <AccordionTrigger>Centro de ayuda</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">¿Cómo puedo registrar una comida?</h4>
                  <p className="text-sm text-muted-foreground">Usa el botón + en la parte inferior para agregar comidas a tu registro diario.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">¿Cómo se calculan mis necesidades nutricionales?</h4>
                  <p className="text-sm text-muted-foreground">Se basan en tu peso, altura, edad, género y nivel de actividad física.</p>
                </div>
                <Button className="w-full" variant="outline">Ver todas las preguntas</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="suggestions">
            <AccordionTrigger>Sugerencias</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">¡Nos encantaría conocer tu opinión! Envíanos tus ideas para mejorar la aplicación.</p>
                <textarea 
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="Escribe tu sugerencia aquí..."
                ></textarea>
                <Button className="w-full" onClick={submitFeedback}>Enviar sugerencia</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="terms">
            <AccordionTrigger>Términos y políticas</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <Button className="w-full" variant="ghost">Términos de uso</Button>
                <Button className="w-full" variant="ghost">Políticas de privacidad</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <DialogFooter className="sm:justify-between mt-4">
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
          <Button onClick={handleSaveSettings}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
      
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar cuenta?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
