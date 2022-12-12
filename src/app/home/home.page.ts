import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController, IonContent, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService, Datos, Message, User } from '../servicios/auth.service';
import * as CryptoJS from 'crypto-js';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import {PhotoService, UserPhoto} from '../servicios/photo.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage{

  @ViewChild(IonContent) content: IonContent;

  //passwordAES = 'AndresExamen';
  user='';
  nombre = null;
  apellido= null;
  cedula= null;
  numfamilia= null;
  uid = null;
  latitude =null;
  longitude = null;
  info: Datos=null;
  imagen =null;


  constructor(
    private autservice:AuthService,
    private router:Router,
    public loadingCtrl: LoadingController,
    private alertController: AlertController,
    public photoService: PhotoService,
    public actionSheetController: ActionSheetController
    ) 
    {}

    async ngOnInit(){
      this.user = this.autservice.currentUser.email;
      this.uid = this.autservice.currentUser.uid;
      console.log("usuario email: ",this.user);
      console.log("usuario id: ", this.uid);
      await this.photoService.loadSaved();
    }

    logout(){
      this.autservice.logout().then(()=>{
        this.router.navigateByUrl('/',{replaceUrl:true});
      })
    }
  
    formulario(){
      this.router.navigateByUrl('/datos-personales', {replaceUrl : true});
    }


//-------------------------OBTENIENDO INFORMACIÓN DE COLECCIÓN datos-censo----------------------
  getInfoUser(){
    const path = "datos-censo";
    const id = this.uid;
    this.autservice.getDoc<Datos>(path, id).subscribe(res=>{
      if(res){
        this.info = res;
        this.nombre = this.info.nombre;
        this.apellido=this.info.apellido;
        this.cedula=this.info.cedula;
        this.numfamilia = this.info.numfamilia;
        this.latitude = this.info.latitude;
        this.longitude = this.info.longitude;
        this.imagen = this.info.imagen;
      }
      console.log('datos:', res);
    })
  }

  //-------------ACTUALIZAR INFORMACIÓN-----------------
  //editar
  async editAtributo(name:string){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: "Editar "+name,
      inputs:[
        {
          name,
          type: 'text',
          placeholder: 'Ingresar '+name
        },
      ],
      buttons: [
        //boton cancelar
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () =>{
            console.log("Acción cancelada");
          }
        },
        {
          //boton aceptar
          text: 'Aceptar',
          handler: (ev) =>{
            console.log("Acción confirmada", ev);
            this.saveAtributo(name, ev[name])
          }
        }
    ]
    });
    await alert.present();
  }
  //guardar
  saveAtributo(name: string, input:any){
    const path = "datos-censo";
    const id = this.uid;
    const updateDoc = {};
    updateDoc[name] = input
    this.autservice.updateDoc(path, id, updateDoc).then(() =>{
      alert("Actualizado correctamente");
    })
  }

  //---------------------PARA IMAGEN-----------------

  //-------------------------------------------------------------------------
  public async showActionSheet(photo: UserPhoto, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Eliminar',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePicture(photo, position);
          
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
         }
      }]
    });
    await actionSheet.present();
  }


}
