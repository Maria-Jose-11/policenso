import { Injectable } from '@angular/core';
import{AngularFireAuth} from '@angular/fire/auth';
import{AngularFirestore} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import "firebase/firestore"
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';


export interface User {
  uid:string;
  email:string;
  
}

export interface Message{
  createAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName:string;
  myMsg:boolean;
  img:File;
  

}

export interface Datos{
  nombre:string;
  apellido:string;
  cedula:string;
  numfamilia:string;
  latitude: string;
  longitude:string;
  imagen:string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser:User = null;
  currentDatos:Datos = null;
  msgDesEncryp:string;

  constructor(private AFauth: AngularFireAuth, private afs:AngularFirestore, public storage: AngularFireStorage) {
    this.AFauth.onAuthStateChanged(user=>{
      console.log("Change",user);
      this.currentUser=user;
    })
  }

//---------------------INICIAR SESIÓN----------------------
  login(email:string,password:string){
    return new Promise((resolve,rejected)=>{
      this.AFauth.signInWithEmailAndPassword(email,password).then(user =>{
        resolve(user)
      }).catch(err=>rejected(err));
    });  
  }


//-------CREAR COLECCIÓN PARA BASE DE DATOS
  createCollection(data: any, path:string, id:string){
    const collection = this.afs.collection(path);
    return collection.doc(id).set(data);
  }


//-------------------------REGISTRARSE----------------------------------
  async singUp(email:string,password:string){
    const credential = await this.AFauth.createUserWithEmailAndPassword(email,password);
    console.log("Credential:"+credential)
    const uid = credential.user.uid;
    return this.afs.doc(
      `users/${uid}`
    ).set({
      uid,
      email: credential.user.email
    });
  }

  registerUser(value) {
    return new Promise<any>((resolve, reject) => {

      this.AFauth.createUserWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err))
    })
  }


  //------------CERRAR SESIÓN---------------------------
  logout(){
    return this.AFauth.signOut();
  }

  getUsers(){
      return this.afs.collection('users').valueChanges({idField:'uid'}) as Observable<User[]>;
  }


  //---------------------PARA LEER INFORMACIÓN DE USUARIO-----------------
  getDoc <tipo> (path:string, id:string){
    return this.afs.collection(path).doc<tipo>(id).valueChanges();
  }

  async addDatosPersonales(email, nombre, apellido, cedula, numfamilia, latitude, longitude){
    const datos = {
      email, 
      nombre, 
      apellido, 
      cedula, 
      numfamilia,
      latitude,
      longitude,
      from:this.currentUser.uid,   
      createAt: firebase.firestore.FieldValue.serverTimestamp()
    }
    console.log('datos', datos);
    const path = "datos-censo";
    const id = this.currentUser.uid;
    this.createCollection(datos, path, id);
  }



updateDoc(path: string, id: string, data: any){
  return this.afs.collection(path).doc(id).update(data);
}
  
}
