import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;

    } catch (error) {
      this.handleExceptions(error);
    }
    //return createPokemonDto;
    //return 'This action adds a new pokemon';
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    //console.log(`Searching for: ${term}`);
  
    // Check if term is a number
    if (!isNaN(+term)) {
      //console.log(`Searching by number: ${term}`);
      pokemon = await this.pokemonModel.findOne({ no: term });
    }
  
    // Check if term is a valid MongoID
    if (!pokemon && isValidObjectId(term)) {
      //console.log(`Searching by MongoID: ${term}`);
      pokemon = await this.pokemonModel.findById(term);
    }
  
    // Check if term is a name
    if (!pokemon) {
      //console.log(`Searching by name: ${term.toLowerCase().trim()}`);
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
    }
  
    if (!pokemon) {
      //console.error(`Pokemon with id, name or no "${term}" not found`);
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`);
    }
  
    //console.log(`Pokemon found: ${pokemon}`);
    return pokemon;
  }
  

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }
    try {
      await pokemon.updateOne( updatePokemonDto, {new: true});

      return {...pokemon.toJSON(), ...updatePokemonDto}
    } catch (error) {
      this.handleExceptions(error);
    }

    //return `This action updates a #${id} pokemon`;
  }

  async remove( id: string ) {
    //const pokemon = await this.findOne(id);
    //await pokemon.deleteOne();
    
    //const result = await this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if(deletedCount === 0)  
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    
    return deletedCount;
    //return `This action removes a #${id} pokemon`;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in db ${ JSON.stringify(error.keyValue) }`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create pokemon - Check server logs`);
  }
}
